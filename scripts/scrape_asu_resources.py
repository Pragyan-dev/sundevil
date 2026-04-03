#!/usr/bin/env python3

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import requests
from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
RESOURCES_PATH = DATA_DIR / "asu_resources.json"
SCHOLARSHIPS_PATH = DATA_DIR / "asu_scholarships.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36"
    )
}


@dataclass(frozen=True)
class ResourceSeed:
    slug: str
    url: str
    payload: dict[str, Any]


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def fetch_page(url: str) -> dict[str, str]:
    try:
        response = requests.get(url, headers=HEADERS, timeout=20)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
    except requests.RequestException:
        return {"title": "", "description": "", "body": ""}

    title = clean_text(soup.title.get_text(" ", strip=True)) if soup.title else ""
    meta = soup.find("meta", attrs={"name": "description"}) or soup.find(
        "meta", attrs={"property": "og:description"}
    )
    description = clean_text(meta.get("content", "")) if meta else ""
    paragraphs = [
        clean_text(node.get_text(" ", strip=True))
        for node in soup.select("main p, article p, .region-content p")
    ]
    body = " ".join(paragraphs[:6])
    return {"title": title, "description": description, "body": body}


def choose_text(*values: str) -> str:
    for value in values:
        if value and value.strip():
            return clean_text(value)
    return ""


RESOURCE_SEEDS = [
    ResourceSeed(
        slug="tutoring",
        url="https://tutoring.asu.edu/about-us",
        payload={
            "id": "resource-tutoring",
            "slug": "tutoring",
            "name": "ASU Tutoring",
            "category": "Academic Support",
            "description": (
                "Free academic help in writing, math, science, business and other subjects "
                "through peer tutors online and across ASU campuses."
            ),
            "location": "In-person support centers across ASU campuses and online tutoring spaces.",
            "hours": "Hours vary by subject and campus. Check the tutoring schedule for the latest openings.",
            "signUpSummary": (
                "Most tutoring is drop-in. Writing support and some specialty services use scheduled appointments."
            ),
            "url": "https://tutoring.asu.edu/about-us",
            "previewPath": "/simulate/tutoring",
            "flowSteps": [
                {
                    "title": "Open tutoring.asu.edu",
                    "description": "Start on the Academic Support Network site and pick the tutoring option that matches your course.",
                },
                {
                    "title": "Choose your subject or tutoring type",
                    "description": "Look for your class, writing support, or the online tutoring menu.",
                },
                {
                    "title": "Pick a time or drop-in option",
                    "description": "Some services are scheduled and some are open drop-in while the center is running.",
                },
                {
                    "title": "Bring your class materials",
                    "description": "Show up with your homework, notes, or draft so the tutor can meet you where you are.",
                },
                {
                    "title": "Join the session",
                    "description": "You will work with a peer tutor and leave with a clearer next step for the assignment.",
                },
            ],
        },
    ),
    ResourceSeed(
        slug="advising",
        url="https://students.asu.edu/academic-advising",
        payload={
            "id": "resource-advising",
            "slug": "advising",
            "name": "Academic Advising",
            "category": "Planning Support",
            "description": (
                "Academic advisors help with class schedules, degree requirements, major questions, and planning your next semester."
            ),
            "location": "Appointments happen through your college advising office in MyASU, often online or on your campus.",
            "hours": "Most advising offices keep weekday appointment times. Check MyASU for your college's schedule.",
            "signUpSummary": (
                "Use MyASU or your advising office page to schedule an appointment, then bring your questions and degree concerns."
            ),
            "url": "https://students.asu.edu/academic-advising",
            "previewPath": "/simulate/advising",
            "flowSteps": [
                {
                    "title": "Go to MyASU or the advising page",
                    "description": "Open your advising link from MyASU or your college's advising website.",
                },
                {
                    "title": "Select an advising appointment",
                    "description": "Pick the reason for the visit, like schedule planning, changing majors, or registration questions.",
                },
                {
                    "title": "Choose a date and format",
                    "description": "Book the time that works for you and confirm whether it is virtual, phone, or in person.",
                },
                {
                    "title": "Show up with your questions",
                    "description": "Bring your current schedule, goals, and any confusing holds or deadlines you want explained.",
                },
            ],
        },
    ),
    ResourceSeed(
        slug="counseling",
        url="https://eoss.asu.edu/counseling/about-us",
        payload={
            "id": "resource-counseling",
            "slug": "counseling",
            "name": "ASU Counseling Services",
            "category": "Wellness Support",
            "description": (
                "Confidential counseling and crisis support for stress, anxiety, overwhelm, transitions, and other concerns affecting school or life."
            ),
            "location": "Counseling support is available across ASU campuses, with phone support for urgent concerns.",
            "hours": "Appointment windows vary by campus. Check the counseling site for current clinic and crisis support details.",
            "signUpSummary": (
                "Start through the counseling website or contact options, answer a few intake questions, and get matched to the right next step."
            ),
            "url": "https://eoss.asu.edu/counseling/about-us",
            "previewPath": "/flow/counseling",
            "flowSteps": [
                {
                    "title": "Open the counseling services site",
                    "description": "Review the counseling overview and find the contact or appointment option that fits your need.",
                },
                {
                    "title": "Choose urgent or routine support",
                    "description": "If it is an emergency, use crisis support. Otherwise start the regular appointment process.",
                },
                {
                    "title": "Complete intake details",
                    "description": "Share basic information about what is going on so the team can route you appropriately.",
                },
                {
                    "title": "Attend your first conversation",
                    "description": "Your first session focuses on what you need and what kind of support would feel useful next.",
                },
            ],
        },
    ),
    ResourceSeed(
        slug="financial-aid",
        url="https://tuition.asu.edu/financial-aid/fafsa",
        payload={
            "id": "resource-financial-aid",
            "slug": "financial-aid",
            "name": "Financial Aid",
            "category": "Money Support",
            "description": (
                "ASU financial aid explains FAFSA, aid eligibility, contributor requirements, and the follow-up steps that show up in MyASU."
            ),
            "location": "Start online through ASU Tuition and MyASU. Additional help is available through ASU financial aid contacts.",
            "hours": "Most online guidance is always available. Office contact and advising hours vary by term and office.",
            "signUpSummary": (
                "Complete the FAFSA or CSS Profile if needed, then watch MyASU for tasks, verification, and award updates."
            ),
            "url": "https://tuition.asu.edu/financial-aid/fafsa",
            "previewPath": "/flow/financial-aid",
            "flowSteps": [
                {
                    "title": "Read the FAFSA guidance",
                    "description": "Start on ASU's FAFSA page so you know which form applies to your situation.",
                },
                {
                    "title": "Go to StudentAid.gov",
                    "description": "Complete the FAFSA and gather the tax, income, and contributor information you need.",
                },
                {
                    "title": "Submit and monitor MyASU",
                    "description": "After filing, check your ASU tasks regularly for verification requests or missing documents.",
                },
                {
                    "title": "Review your award steps",
                    "description": "Accept aid, complete remaining tasks, and follow the timing ASU gives you for disbursement or follow-up.",
                },
            ],
        },
    ),
    ResourceSeed(
        slug="scholarship-search",
        url="https://students.asu.edu/scholarships",
        payload={
            "id": "resource-scholarship-search",
            "slug": "scholarship-search",
            "name": "ASU Scholarship Search",
            "category": "Money Support",
            "description": (
                "ASU scholarship search tools help students look for merit, need-based, major-specific, and school-level scholarship opportunities."
            ),
            "location": "Online only through ASU scholarship and tuition pages.",
            "hours": "Available online anytime. Application deadlines depend on each scholarship.",
            "signUpSummary": (
                "Search available scholarships, read the criteria carefully, and apply before each individual deadline."
            ),
            "url": "https://students.asu.edu/scholarships",
            "previewPath": "/scholarships",
            "flowSteps": [
                {
                    "title": "Open the scholarship search page",
                    "description": "Start from ASU's scholarships overview and review the options tied to your college or student profile.",
                },
                {
                    "title": "Filter by fit",
                    "description": "Look for awards that match your major, residency, year, and financial need status.",
                },
                {
                    "title": "Check each deadline",
                    "description": "Every scholarship has its own date and application requirements, so note those before you start.",
                },
                {
                    "title": "Submit the application",
                    "description": "Complete the scholarship application or portal step for the opportunities that match you best.",
                },
            ],
        },
    ),
    ResourceSeed(
        slug="career-services",
        url="https://students.asu.edu/admitted/jobs-careers",
        payload={
            "id": "resource-career-services",
            "slug": "career-services",
            "name": "Career and Professional Development Services",
            "category": "Career Support",
            "description": (
                "Career support helps with resumes, internships, part-time jobs, interviews, Handshake listings, and making a career plan."
            ),
            "location": "Career and student employment support is offered online and across ASU campuses.",
            "hours": "Appointment times and employer events vary. Check the current career services schedule online.",
            "signUpSummary": (
                "Start with the jobs and careers pages, then use career services or Handshake for appointments, postings, and next steps."
            ),
            "url": "https://students.asu.edu/admitted/jobs-careers",
            "previewPath": "/flow/career-services",
            "flowSteps": [
                {
                    "title": "Open the jobs and careers page",
                    "description": "Review the options for internships, part-time work, resume help, and career planning.",
                },
                {
                    "title": "Choose the support you need",
                    "description": "Decide whether you are looking for job listings, a resume review, interview prep, or a career appointment.",
                },
                {
                    "title": "Use the matching platform",
                    "description": "That may mean Handshake, a career center appointment, or the student employment process.",
                },
                {
                    "title": "Follow through on the next action",
                    "description": "Upload your materials, book the meeting, or apply to the role directly from the listed system.",
                },
            ],
        },
    ),
    ResourceSeed(
        slug="student-success-center",
        url="https://success.asu.edu",
        payload={
            "id": "resource-student-success-center",
            "slug": "student-success-center",
            "name": "Student Success Center",
            "category": "Coaching Support",
            "description": (
                "Student Success Center coaching helps students build routines, stay organized, and connect with support before small problems turn into big ones."
            ),
            "location": "Student Success Center coaching is offered across ASU campuses, online, and through pop-up coaching events.",
            "hours": "Coaching hours and event times vary by campus and semester.",
            "signUpSummary": (
                "Find a coaching option or event on the Student Success Center site and choose the format that feels easiest to try."
            ),
            "url": "https://success.asu.edu",
            "previewPath": "/simulate/first-day",
            "flowSteps": [
                {
                    "title": "Open success.asu.edu",
                    "description": "Review coaching, events, and pop-up support options from the Student Success Center home page.",
                },
                {
                    "title": "Pick a support style",
                    "description": "Choose between a coaching appointment, event, or low-pressure pop-up conversation.",
                },
                {
                    "title": "Register or note the event details",
                    "description": "Save the location, time, or meeting link so you know exactly what happens next.",
                },
                {
                    "title": "Show up and talk it through",
                    "description": "The first conversation usually focuses on your routine, stress points, and the campus tools that could help most.",
                },
            ],
        },
    ),
]


SCHOLARSHIPS = [
    {
        "id": "scholarship-nam-u",
        "name": "New American University Scholarship",
        "amount": "$2,000-$15,500 per year",
        "deadlineLabel": "Priority timing varies with admission and renewal cycles",
        "applicationUrl": "https://students.asu.edu/scholarships",
        "description": "ASU merit scholarship support for high-achieving undergraduate students.",
        "eligibility": {
            "years": ["first-year"],
            "majors": ["any"],
            "gpaRanges": ["3.5-4.0"],
            "firstGen": ["yes", "no", "not-sure"],
            "residency": ["in-state", "out-of-state"],
            "aidStatus": ["fafsa-filed", "not-filed", "not-sure"],
        },
    },
    {
        "id": "scholarship-obama",
        "name": "Obama Scholars Program",
        "amount": "Varies based on financial need",
        "deadlineLabel": "Align with FAFSA and ASU aid deadlines",
        "applicationUrl": "https://students.asu.edu/scholarships",
        "description": "Support for Arizona first-year students with high financial need.",
        "eligibility": {
            "years": ["first-year"],
            "majors": ["any"],
            "gpaRanges": ["3.0-3.49", "3.5-4.0"],
            "firstGen": ["yes", "no"],
            "residency": ["in-state"],
            "aidStatus": ["fafsa-filed"],
        },
    },
    {
        "id": "scholarship-general-clas",
        "name": "The College Scholarship Pool",
        "amount": "$1,000-$5,000",
        "deadlineLabel": "Spring application cycle",
        "applicationUrl": "https://students.asu.edu/scholarships",
        "description": "General ASU college-level scholarship opportunities for a wide range of majors.",
        "eligibility": {
            "years": ["first-year", "second-year", "third-year", "fourth-year-plus"],
            "majors": ["arts-humanities", "business", "education", "engineering", "health", "science", "social-sciences", "undeclared", "other"],
            "gpaRanges": ["2.5-2.99", "3.0-3.49", "3.5-4.0"],
            "firstGen": ["yes", "no", "not-sure"],
            "residency": ["in-state", "out-of-state", "international"],
            "aidStatus": ["fafsa-filed", "not-filed", "not-sure"],
        },
    },
    {
        "id": "scholarship-first-gen-zone",
        "name": "First-Generation Student Support Scholarship",
        "amount": "$1,500",
        "deadlineLabel": "Late spring",
        "applicationUrl": "https://success.asu.edu",
        "description": "A curated demo scholarship for first-generation students engaged with success programming.",
        "eligibility": {
            "years": ["first-year", "second-year"],
            "majors": ["any"],
            "gpaRanges": ["2.5-2.99", "3.0-3.49", "3.5-4.0"],
            "firstGen": ["yes"],
            "residency": ["in-state", "out-of-state"],
            "aidStatus": ["fafsa-filed", "not-sure"],
        },
    },
    {
        "id": "scholarship-fulton",
        "name": "Fulton Schools Undergraduate Scholarship",
        "amount": "$2,500",
        "deadlineLabel": "February",
        "applicationUrl": "https://students.asu.edu/scholarships",
        "description": "Scholarship opportunities for undergraduate engineering students.",
        "eligibility": {
            "years": ["first-year", "second-year", "third-year", "fourth-year-plus"],
            "majors": ["engineering"],
            "gpaRanges": ["3.0-3.49", "3.5-4.0"],
            "firstGen": ["yes", "no", "not-sure"],
            "residency": ["in-state", "out-of-state", "international"],
            "aidStatus": ["fafsa-filed", "not-filed", "not-sure"],
        },
    },
    {
        "id": "scholarship-business",
        "name": "W. P. Carey Undergraduate Scholarship",
        "amount": "$1,500-$4,000",
        "deadlineLabel": "February",
        "applicationUrl": "https://students.asu.edu/scholarships",
        "description": "Scholarship pool for students pursuing business-related majors.",
        "eligibility": {
            "years": ["second-year", "third-year", "fourth-year-plus"],
            "majors": ["business"],
            "gpaRanges": ["3.0-3.49", "3.5-4.0"],
            "firstGen": ["yes", "no", "not-sure"],
            "residency": ["in-state", "out-of-state", "international"],
            "aidStatus": ["fafsa-filed", "not-filed", "not-sure"],
        },
    },
    {
        "id": "scholarship-teachers",
        "name": "Mary Lou Fulton Future Educator Scholarship",
        "amount": "$2,000",
        "deadlineLabel": "February",
        "applicationUrl": "https://students.asu.edu/scholarships",
        "description": "Support for students preparing for careers in education.",
        "eligibility": {
            "years": ["first-year", "second-year", "third-year", "fourth-year-plus"],
            "majors": ["education"],
            "gpaRanges": ["3.0-3.49", "3.5-4.0"],
            "firstGen": ["yes", "no", "not-sure"],
            "residency": ["in-state", "out-of-state"],
            "aidStatus": ["fafsa-filed", "not-filed", "not-sure"],
        },
    },
    {
        "id": "scholarship-health",
        "name": "Health Solutions Student Scholarship",
        "amount": "$1,000-$3,500",
        "deadlineLabel": "Spring",
        "applicationUrl": "https://students.asu.edu/scholarships",
        "description": "Support for students in health-related programs.",
        "eligibility": {
            "years": ["second-year", "third-year", "fourth-year-plus"],
            "majors": ["health"],
            "gpaRanges": ["3.0-3.49", "3.5-4.0"],
            "firstGen": ["yes", "no", "not-sure"],
            "residency": ["in-state", "out-of-state", "international"],
            "aidStatus": ["fafsa-filed", "not-filed", "not-sure"],
        },
    },
    {
        "id": "scholarship-science",
        "name": "STEM Persistence Scholarship",
        "amount": "$2,000",
        "deadlineLabel": "Rolling while funds last",
        "applicationUrl": "https://students.asu.edu/scholarships",
        "description": "A demo STEM-focused scholarship for students continuing in science and technology fields.",
        "eligibility": {
            "years": ["second-year", "third-year"],
            "majors": ["engineering", "science"],
            "gpaRanges": ["2.5-2.99", "3.0-3.49", "3.5-4.0"],
            "firstGen": ["yes", "no", "not-sure"],
            "residency": ["in-state", "out-of-state"],
            "aidStatus": ["fafsa-filed", "not-sure"],
        },
    },
    {
        "id": "scholarship-transfer",
        "name": "Transfer Achievement Award",
        "amount": "$3,000",
        "deadlineLabel": "Admission cycle",
        "applicationUrl": "https://students.asu.edu/scholarships",
        "description": "Merit support for students transferring into ASU.",
        "eligibility": {
            "years": ["third-year", "fourth-year-plus"],
            "majors": ["any"],
            "gpaRanges": ["3.0-3.49", "3.5-4.0"],
            "firstGen": ["yes", "no", "not-sure"],
            "residency": ["in-state", "out-of-state"],
            "aidStatus": ["fafsa-filed", "not-filed", "not-sure"],
        },
    },
    {
        "id": "scholarship-resident",
        "name": "Arizona Resident Need Scholarship",
        "amount": "$1,250",
        "deadlineLabel": "After FAFSA review",
        "applicationUrl": "https://tuition.asu.edu/financial-aid/fafsa",
        "description": "A demo need-based award modeled for Arizona residents with FAFSA on file.",
        "eligibility": {
            "years": ["first-year", "second-year", "third-year", "fourth-year-plus"],
            "majors": ["any"],
            "gpaRanges": ["2.5-2.99", "3.0-3.49", "3.5-4.0"],
            "firstGen": ["yes", "no", "not-sure"],
            "residency": ["in-state"],
            "aidStatus": ["fafsa-filed"],
        },
    },
    {
        "id": "scholarship-community",
        "name": "Community Impact Scholarship",
        "amount": "$1,000",
        "deadlineLabel": "March",
        "applicationUrl": "https://students.asu.edu/scholarships",
        "description": "A demo award for students active in service, leadership, or peer support communities.",
        "eligibility": {
            "years": ["second-year", "third-year", "fourth-year-plus"],
            "majors": ["arts-humanities", "education", "health", "social-sciences", "other"],
            "gpaRanges": ["2.5-2.99", "3.0-3.49", "3.5-4.0"],
            "firstGen": ["yes", "no", "not-sure"],
            "residency": ["in-state", "out-of-state", "international"],
            "aidStatus": ["fafsa-filed", "not-filed", "not-sure"],
        },
    },
]


def build_resources() -> list[dict[str, Any]]:
    resources: list[dict[str, Any]] = []
    for seed in RESOURCE_SEEDS:
        fetched = fetch_page(seed.url)
        payload = dict(seed.payload)
        payload["description"] = choose_text(
            payload["description"],
            fetched["description"],
            fetched["body"],
        )
        payload["location"] = choose_text(payload["location"], "See the ASU site for location details.")
        payload["hours"] = choose_text(payload["hours"], "See the ASU site for current hours.")
        payload["signUpSummary"] = choose_text(
            payload["signUpSummary"],
            fetched["body"],
            "Visit the linked ASU page for current sign-up steps.",
        )
        resources.append(payload)
        title = fetched["title"] or "manual fallback"
        print(f"[resource] {seed.slug}: {title}")
    return resources


def dump_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n")


def main() -> None:
    resources = build_resources()
    dump_json(RESOURCES_PATH, resources)
    dump_json(SCHOLARSHIPS_PATH, SCHOLARSHIPS)
    print(f"[done] wrote {RESOURCES_PATH}")
    print(f"[done] wrote {SCHOLARSHIPS_PATH}")


if __name__ == "__main__":
    main()
