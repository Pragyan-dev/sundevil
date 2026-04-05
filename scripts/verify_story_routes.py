from playwright.sync_api import expect, sync_playwright


BASE = "http://127.0.0.1:3100"

READY_CHOICES = [
    '"Open MyASU now and save the details."',
    '"Write down two questions first."',
    '"Open Canvas and each syllabus tonight."',
    '"Send the short honest email now."',
    '"Show your notes and ask about the first problem."',
    '"Open MyASU and knock out the priority tasks now."',
]

RHYTHM_CHOICES = [
    '"Open MyASU now and save the details."',
    '"Write down two questions first."',
    '"Open Canvas and each syllabus tonight."',
    '"Keep rewriting it until it feels embarrassing."',
    '"Hover for a minute and hope you do not sound lost."',
    '"Avoid it a little longer because the screen is confusing."',
]

ADJUSTING_CHOICES = [
    '"Open MyASU now and save the details."',
    '"Just walk in and hope the conversation carries me."',
    "\"Tell yourself you'll look tomorrow.\"",
    '"Keep rewriting it until it feels embarrassing."',
    '"Hover for a minute and hope you do not sound lost."',
    '"Avoid it a little longer because the screen is confusing."',
]


def settle(page):
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(250)


def click_primary(page):
    button = page.locator("button.button-primary").first
    expect(button).to_be_visible(timeout=3000)
    button.click()
    page.wait_for_timeout(250)


def choose_choice(page, label: str):
    option = page.locator(".story-choice-card").filter(has_text=label).first
    expect(option).to_be_visible(timeout=3000)
    option.click()
    page.wait_for_timeout(250)


def advance_until_video(
    page,
    expected_src_suffix: str,
    choice_label: str | None = None,
    fallback_src_suffix: str | None = None,
):
    for _ in range(12):
        if page.locator("video").count():
            break
        if choice_label and page.locator(".story-choice-card").filter(has_text=choice_label).count():
            choose_choice(page, choice_label)
            continue
        if page.locator(".story-choice-card").count():
            seen = page.locator(".story-choice-card strong").all_inner_texts()
            raise AssertionError(
                f"Unexpected choice screen while looking for video {expected_src_suffix}: {seen}",
            )
        click_primary(page)
    else:
        raise AssertionError(f"No video found for {expected_src_suffix}")

    video = page.locator("video").first
    expect(video).to_be_visible(timeout=3000)
    sources = page.locator("video source")
    src = sources.first.get_attribute("src")
    poster = video.get_attribute("poster")
    muted = page.evaluate("() => document.querySelector('video')?.muted")
    controls = page.evaluate("() => document.querySelector('video')?.controls")
    plays_inline = video.get_attribute("playsinline")

    assert src and src.endswith(expected_src_suffix), src
    if fallback_src_suffix:
        fallback_src = sources.nth(1).get_attribute("src")
        assert fallback_src and fallback_src.endswith(fallback_src_suffix), fallback_src
    assert poster and poster.endswith(".svg"), poster
    assert muted is True, muted
    assert controls is True, controls
    assert plays_inline is not None, plays_inline
    expect(page.get_by_text("Video preview", exact=True)).to_be_visible(timeout=3000)


def play_story(page, labels: list[str], expected_ending: str):
    page.goto(f"{BASE}/simulate", wait_until="networkidle")
    settle(page)
    expect(page.get_by_text("Campus Confidence").first).to_be_visible(timeout=3000)

    for label in labels:
        for _ in range(12):
            target = page.locator(".story-choice-card").filter(has_text=label)
            if target.count():
                choose_choice(page, label)
                break
            if page.locator(".story-ending-hero h3").count():
                raise AssertionError(f"Story ended before choice {label}")
            if page.locator(".story-choice-card").count():
                seen = page.locator(".story-choice-card strong").all_inner_texts()
                raise AssertionError(f"Expected choice {label}, saw {seen}")
            click_primary(page)
        else:
            raise AssertionError(f"Choice not reached: {label}")

    for _ in range(20):
        if page.locator(".story-ending-hero h3").count():
            break
        if page.locator(".story-choice-card").count():
            seen = page.locator(".story-choice-card strong").all_inner_texts()
            raise AssertionError(f"Unexpected extra choice before ending: {seen}")
        click_primary(page)
    else:
        raise AssertionError("Ending scene not reached")

    ending = page.locator(".story-ending-hero h3").first.inner_text().strip()
    assert ending == expected_ending, ending
    expect(page.get_by_text("Milestones You Hit This Week")).to_be_visible(timeout=3000)


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)

    preview_context = browser.new_context(viewport={"width": 1440, "height": 1100})
    preview_page = preview_context.new_page()

    preview_page.goto(f"{BASE}/simulate/first-day", wait_until="networkidle")
    settle(preview_page)
    expect(
        preview_page.get_by_text("This preview does not overwrite the saved full playthrough."),
    ).to_be_visible(timeout=3000)
    advance_until_video(
        preview_page,
        "/videos/story/python-first-week.mp4",
        fallback_src_suffix="/videos/story/python-classroom.mp4",
    )
    click_primary(preview_page)
    advance_until_video(preview_page, "/videos/story/math-classroom.mp4")
    click_primary(preview_page)
    advance_until_video(preview_page, "/videos/story/chemistry-classroom.mp4")

    preview_page.goto(f"{BASE}/simulate/advising", wait_until="networkidle")
    settle(preview_page)
    advance_until_video(
        preview_page,
        "/videos/story/student-advising-session.mp4",
        '"Write down two questions first."',
        fallback_src_suffix="/videos/story/advising-center.mp4",
    )

    preview_page.goto(f"{BASE}/simulate/office-hours", wait_until="networkidle")
    settle(preview_page)
    advance_until_video(
        preview_page,
        "/videos/story/office-hours.mp4",
        '"Show your notes and ask about the first problem."',
    )

    preview_page.goto(f"{BASE}/simulate", wait_until="networkidle")
    settle(preview_page)
    assert preview_page.locator("text=Resume your first week?").count() == 0

    redirect_page = preview_context.new_page()
    redirect_page.goto(f"{BASE}/simulate/tutoring", wait_until="networkidle")
    settle(redirect_page)
    assert redirect_page.url.endswith("/simulate/office-hours"), redirect_page.url
    redirect_page.close()
    preview_context.close()

    resume_context = browser.new_context(viewport={"width": 1440, "height": 1100})
    resume_page = resume_context.new_page()
    resume_page.goto(f"{BASE}/simulate", wait_until="networkidle")
    settle(resume_page)
    for _ in range(4):
        click_primary(resume_page)
    choose_choice(resume_page, '"Open MyASU now and save the details."')
    resume_page.reload(wait_until="networkidle")
    settle(resume_page)
    expect(resume_page.get_by_text("Resume your first week?")).to_be_visible(timeout=3000)
    resume_page.get_by_role("button", name="Resume story").click()
    expect(
        resume_page.get_by_role("heading", name="You make tomorrow easier on purpose."),
    ).to_be_visible(timeout=3000)
    saved_state = resume_page.evaluate(
        "() => window.localStorage.getItem('sundevilconnect-first-week-story-v2')",
    )
    assert saved_state, "expected saved story state"
    resume_context.close()

    ready_context = browser.new_context(viewport={"width": 1440, "height": 1100})
    ready_page = ready_context.new_page()
    play_story(ready_page, READY_CHOICES, "You Feel Ready")
    ready_context.close()

    rhythm_context = browser.new_context(viewport={"width": 1440, "height": 1100})
    rhythm_page = rhythm_context.new_page()
    play_story(rhythm_page, RHYTHM_CHOICES, "You're Finding Your Rhythm")
    rhythm_context.close()

    adjusting_context = browser.new_context(viewport={"width": 1440, "height": 1100})
    adjusting_page = adjusting_context.new_page()
    play_story(adjusting_page, ADJUSTING_CHOICES, "You're Still Adjusting")
    adjusting_context.close()

    browser.close()

print("ALL_CHECKS_PASSED")
