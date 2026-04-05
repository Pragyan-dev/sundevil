"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type StudentStatus = "Needs check-in" | "Warm outreach sent" | "Faculty follow-up" | "On track";
type ConcernLevel = "High attention" | "Watch closely" | "Steady";
type ActionType = "nudge" | "check-in" | "stable";

interface StudentRecord {
  id: string;
  student: string;
  firstName: string;
  pronouns: string;
  week: string;
  year: string;
  major: string;
  status: StudentStatus;
  concernLevel: ConcernLevel;
  lastTouch: string;
  resourcePattern: string;
  supportFocus: string;
  contextTags: string[];
  strengths: string[];
  recentSignals: string[];
  checkInPrompts: string[];
  recommendedLink: {
    href: string;
    label: string;
    note: string;
  };
  messagePreview: string;
  checkInPreview: string;
  nudgesSent: number;
  checkInsLogged: number;
  followUpPlanned: boolean;
}

interface StudentOverride {
  status: StudentStatus;
  lastTouch: string;
  nudgesSent: number;
  checkInsLogged: number;
  followUpPlanned: boolean;
}

interface ActivityItem {
  title: string;
  detail: string;
  stamp: string;
}

const roster: StudentRecord[] = [
  {
    id: "student-a",
    student: "Student A.",
    firstName: "Marisol",
    pronouns: "she/her",
    week: "Week 1",
    year: "First-year",
    major: "Computer Science",
    status: "Needs check-in",
    concernLevel: "High attention",
    lastTouch: "No faculty touch yet",
    resourcePattern: "No office hours, no advising visit logged yet",
    supportFocus: "Room navigation anxiety and not knowing which question is okay to ask",
    contextTags: ["First-gen", "Tooker House", "Works 8 hrs/week", "Quiet in lecture"],
    strengths: ["Shows up early", "Writes detailed notes", "Stays through the full lecture"],
    recentSignals: [
      "Asked a TA where the math room was after class.",
      "Opened Canvas but has not clicked office-hours guidance yet.",
      "No advising check-in during first week.",
    ],
    checkInPrompts: [
      "How are you feeling about finding your classes and knowing where to sit?",
      "Do the room numbers and building names still feel confusing?",
      "Would a short first-week story preview help before next class?",
    ],
    recommendedLink: {
      href: "/simulate/first-day",
      label: "Open first-day class tour",
      note: "Good for students who still feel shaky about rooms, directions, and what a big lecture looks like.",
    },
    messagePreview:
      "Hi Marisol, I noticed first week can feel like a blur when you are learning course codes, buildings, and expectations at the same time. If walking into the room still feels vague, this short class-tour preview shows what the spaces look like and how students usually settle in: /simulate/first-day. No pressure. I just want you to have a clearer picture before next week.",
    checkInPreview:
      "Marisol mentioned class navigation still feels a little foggy. Recommended a low-pressure first-day preview and invited a quick follow-up after Monday lecture.",
    nudgesSent: 0,
    checkInsLogged: 0,
    followUpPlanned: false,
  },
  {
    id: "student-b",
    student: "Student B.",
    firstName: "Jalen",
    pronouns: "he/him",
    week: "Week 1",
    year: "First-year",
    major: "Software Engineering",
    status: "On track",
    concernLevel: "Steady",
    lastTouch: "Warm reply after welcome email",
    resourcePattern: "Opened syllabus, visited advising, no risk flags",
    supportFocus: "Keep momentum steady without over-messaging",
    contextTags: ["First-gen", "Commuter", "Morning job", "Asks clarifying questions"],
    strengths: ["Introduced himself after class", "Uses calendar reminders", "Already checked DARS"],
    recentSignals: [
      "Completed advising visit on Day 2.",
      "Downloaded all three syllabi and entered deadlines into calendar.",
      "No missing engagement markers this week.",
    ],
    checkInPrompts: [
      "What part of week one feels most under control right now?",
      "Is there anything in Python or math that you want clarified before it builds up?",
      "Would a quick office-hours walkthrough still be helpful later?",
    ],
    recommendedLink: {
      href: "/simulate",
      label: "Open full first-week story",
      note: "A useful optional reinforcement for students already engaged but still learning the system.",
    },
    messagePreview:
      "Hi Jalen, you have already done a lot of the hard setup work in week one. If you want a quick overview of how other first-gen students move through advising, office hours, and MyASU tasks, the full first-week story is here: /simulate. Keep building on what is already working.",
    checkInPreview:
      "Jalen is stable. Keep outreach light and affirm the systems he already started using.",
    nudgesSent: 1,
    checkInsLogged: 1,
    followUpPlanned: false,
  },
  {
    id: "student-c",
    student: "Student C.",
    firstName: "Noor",
    pronouns: "she/they",
    week: "Week 1",
    year: "First-year",
    major: "Data Science",
    status: "Faculty follow-up",
    concernLevel: "Watch closely",
    lastTouch: "Two-minute hallway check-in yesterday",
    resourcePattern: "Reading everything, still hesitant to email faculty",
    supportFocus: "Needs a concrete example of what office-hours outreach looks like",
    contextTags: ["First-gen", "International student", "Lives off campus", "Strong quiz prep habits"],
    strengths: ["Comes prepared", "Uses notebook questions", "Responds well to specifics"],
    recentSignals: [
      "Told a peer she rewrote an email three times and never sent it.",
      "Has office-hours questions but is worried about sounding behind.",
      "Attendance is consistent across all three courses.",
    ],
    checkInPrompts: [
      "Would seeing the exact professor email format make office hours feel less awkward?",
      "Do you want help turning your notes into one office-hours question?",
      "What would make asking for help feel more normal?",
    ],
    recommendedLink: {
      href: "/simulate/office-hours",
      label: "Open office-hours preview",
      note: "Strong fit for students who are overthinking the email or the first minute inside the room.",
    },
    messagePreview:
      "Hi Noor, if office hours feel intimidating mostly because the first email and the room itself are hard to picture, this short preview walks through both parts: /simulate/office-hours. A lot of first-gen students need the process to feel concrete before they try it. That is normal.",
    checkInPreview:
      "Noor is not avoiding support. The barrier is uncertainty about tone and etiquette. Next check-in should normalize asking one specific question.",
    nudgesSent: 1,
    checkInsLogged: 1,
    followUpPlanned: true,
  },
  {
    id: "student-d",
    student: "Student D.",
    firstName: "Eli",
    pronouns: "he/they",
    week: "Week 1",
    year: "First-year",
    major: "Informatics",
    status: "Needs check-in",
    concernLevel: "High attention",
    lastTouch: "No follow-up after first lecture",
    resourcePattern: "Missed advising, has not handled MyASU tasks",
    supportFocus: "Student is juggling work hours and may be avoiding tasks because the portal feels dense",
    contextTags: ["First-gen", "Commutes 40 min", "Works evenings", "Low portal confidence"],
    strengths: ["Stayed after class once", "Responds well to direct asks", "Interested in Python"],
    recentSignals: [
      "Mentioned not knowing whether all enrollment documents were done.",
      "Has not opened advising follow-up link.",
      "Said MyASU looks important but overwhelming.",
    ],
    checkInPrompts: [
      "Are there MyASU tasks or holds that still feel unclear?",
      "Would it help to look at the task list together for two minutes?",
      "Do you know which items are urgent versus just informational?",
    ],
    recommendedLink: {
      href: "/simulate/advising",
      label: "Open advising preview",
      note: "Useful when a student is unsure what happens in advising or what to bring.",
    },
    messagePreview:
      "Hi Eli, first week tasks in MyASU can feel bigger than they are when you are seeing everything for the first time. This advising preview shows what to expect, what DARS means, and what kinds of questions are okay to bring in: /simulate/advising. If you want, we can also do a quick check-in after class.",
    checkInPreview:
      "Eli would benefit from a brief, concrete follow-up on advising and MyASU tasks rather than a broad encouragement email.",
    nudgesSent: 0,
    checkInsLogged: 0,
    followUpPlanned: true,
  },
  {
    id: "student-e",
    student: "Student E.",
    firstName: "Priya",
    pronouns: "she/her",
    week: "Week 1",
    year: "First-year",
    major: "Chemistry",
    status: "Warm outreach sent",
    concernLevel: "Watch closely",
    lastTouch: "Personalized office-hours message sent this morning",
    resourcePattern: "Doing the work, but still assumes questions need to be 'serious' to ask",
    supportFocus: "Help the student see office hours as normal before the first quiz cycle",
    contextTags: ["First-gen", "Barrett interest", "Lives on campus", "High self-pressure"],
    strengths: ["Prepared notes", "Strong attendance", "Reads announcements early"],
    recentSignals: [
      "Opened office-hours preview after outreach.",
      "Has not yet attended a live office-hours visit.",
      "Told lab partner she does not want to waste professor time.",
    ],
    checkInPrompts: [
      "What kind of question would feel small enough to take to office hours first?",
      "Would seeing one example of a normal question help?",
      "Do you want a faculty nudge that explicitly says quick questions are okay?",
    ],
    recommendedLink: {
      href: "/simulate/office-hours",
      label: "Reopen office-hours preview",
      note: "Good follow-up after a warm outreach when the student still has not attended.",
    },
    messagePreview:
      "Hi Priya, you do not need a major problem before office hours is worth using. If it helps, here is the same short preview again so the room and conversation feel more familiar before you go: /simulate/office-hours.",
    checkInPreview:
      "Priya already opened the preview. Next move is a gentle in-person affirmation that small questions are welcome.",
    nudgesSent: 1,
    checkInsLogged: 0,
    followUpPlanned: true,
  },
];

const seedActivity: ActivityItem[] = [
  {
    title: "Faculty digest refreshed",
    detail: "Updated first-week support signals for CSE 110 based on mock engagement markers.",
    stamp: "Today, 8:10 AM",
  },
  {
    title: "Office-hours preview linked",
    detail: "Students with office-hours hesitation now receive the Day 4 preview instead of a generic tutoring nudge.",
    stamp: "Today, 7:35 AM",
  },
  {
    title: "Advising outreach bucket created",
    detail: "Students confused by DARS and MyASU tasks are grouped for low-pressure advising follow-up.",
    stamp: "Yesterday, 5:40 PM",
  },
];

function statusClasses(status: StudentStatus) {
  switch (status) {
    case "Needs check-in":
      return "bg-[rgba(255,198,39,0.18)] text-[var(--asu-maroon)] border border-[rgba(140,29,64,0.12)]";
    case "Warm outreach sent":
      return "bg-[rgba(140,29,64,0.1)] text-[var(--asu-maroon)] border border-[rgba(140,29,64,0.14)]";
    case "Faculty follow-up":
      return "bg-[rgba(47,47,47,0.08)] text-[var(--ink)] border border-[rgba(47,47,47,0.08)]";
    case "On track":
      return "bg-[rgba(255,255,255,0.72)] text-[var(--ink)] border border-[rgba(47,47,47,0.08)]";
  }
}

function concernClasses(level: ConcernLevel) {
  switch (level) {
    case "High attention":
      return "text-[var(--asu-maroon)]";
    case "Watch closely":
      return "text-[var(--ink)]";
    case "Steady":
      return "text-[var(--muted-ink)]";
  }
}

export default function DashboardPage() {
  const [selectedStudentId, setSelectedStudentId] = useState(roster[0].id);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, StudentOverride>>({});
  const [activityFeed, setActivityFeed] = useState(seedActivity);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToastMessage(null), 3400);
    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  const students = roster.map((student) => {
    const override = overrides[student.id];
    return {
      ...student,
      status: override?.status ?? student.status,
      lastTouch: override?.lastTouch ?? student.lastTouch,
      nudgesSent: override?.nudgesSent ?? student.nudgesSent,
      checkInsLogged: override?.checkInsLogged ?? student.checkInsLogged,
      followUpPlanned: override?.followUpPlanned ?? student.followUpPlanned,
    };
  });

  const selectedStudent =
    students.find((student) => student.id === selectedStudentId) ?? students[0];
  const needsCheckIn = students.filter((student) => student.status === "Needs check-in").length;
  const outreachSent = students.filter((student) => student.nudgesSent > 0).length;
  const checkInsLogged = students.reduce((count, student) => count + student.checkInsLogged, 0);
  const followUpsQueued = students.filter((student) => student.followUpPlanned).length;

  function appendActivity(title: string, detail: string) {
    setActivityFeed((current) => [{ title, detail, stamp: "Just now" }, ...current].slice(0, 6));
  }

  function updateStudent(studentId: string, action: ActionType) {
    const baseStudent = students.find((student) => student.id === studentId);

    if (!baseStudent) {
      return;
    }

    setOverrides((current) => {
      const existing = current[studentId];
      const next: StudentOverride = {
        status:
          action === "nudge"
            ? "Warm outreach sent"
            : action === "check-in"
              ? "Faculty follow-up"
              : "On track",
        lastTouch:
          action === "nudge"
            ? "Personalized message sent just now"
            : action === "check-in"
              ? "Check-in logged just now"
              : "Marked stable just now",
        nudgesSent:
          action === "nudge"
            ? (existing?.nudgesSent ?? baseStudent.nudgesSent) + 1
            : (existing?.nudgesSent ?? baseStudent.nudgesSent),
        checkInsLogged:
          action === "check-in"
            ? (existing?.checkInsLogged ?? baseStudent.checkInsLogged) + 1
            : (existing?.checkInsLogged ?? baseStudent.checkInsLogged),
        followUpPlanned: action !== "stable",
      };

      return { ...current, [studentId]: next };
    });

    if (action === "nudge") {
      setToastMessage(`Personalized message queued for ${baseStudent.firstName}.`);
      appendActivity(
        `Nudge sent to ${baseStudent.student}`,
        `Shared ${baseStudent.recommendedLink.label.toLowerCase()} with a message tailored to ${baseStudent.supportFocus.toLowerCase()}.`,
      );
      return;
    }

    if (action === "check-in") {
      setToastMessage(`Check-in logged for ${baseStudent.firstName}.`);
      appendActivity(
        `Check-in saved for ${baseStudent.student}`,
        `Logged a short faculty note: ${baseStudent.checkInPreview}`,
      );
      return;
    }

    setToastMessage(`${baseStudent.firstName} marked as stable for now.`);
    appendActivity(
      `${baseStudent.student} moved to on track`,
      "Faculty marked this student as stable after a review of week-one signals.",
    );
  }

  return (
    <div className="page-shell pb-24">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="paper-card overflow-hidden">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="eyebrow">Static demo</p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
                CSE 110 Faculty Support Console
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--ink)]/78">
                A faculty-facing view of first-week friction for first-gen students: who still feels
                lost, what kind of outreach fits the moment, and which check-in should happen next.
              </p>
            </div>

            <div className="rounded-[2rem] border border-[rgba(140,29,64,0.12)] bg-[linear-gradient(140deg,rgba(140,29,64,0.98),rgba(84,10,32,0.98))] p-6 text-[rgba(255,251,245,0.86)] shadow-[0_24px_70px_rgba(70,6,23,0.18)]">
              <p className="eyebrow text-[var(--asu-gold)]">Faculty lens</p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-tight text-[var(--warm-white)]">
                The goal is not surveillance.
              </h2>
              <p className="mt-4 text-sm leading-7">
                It is earlier clarity. The panel below stays focused on signals faculty can act on:
                confusion about rooms, hesitation around office hours, uncertainty about advising,
                and students who may need a softer first outreach.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-[1.7rem] border border-[rgba(140,29,64,0.1)] bg-[rgba(255,255,255,0.74)] p-5">
              <p className="eyebrow">Needs check-in</p>
              <strong className="mt-4 block text-3xl text-[var(--asu-maroon)]">{needsCheckIn}</strong>
              <p className="mt-3 text-sm leading-7 text-[var(--ink)]/70">
                Students still showing avoidance or uncertainty without any direct faculty touch.
              </p>
            </article>

            <article className="rounded-[1.7rem] border border-[rgba(140,29,64,0.1)] bg-[rgba(255,255,255,0.74)] p-5">
              <p className="eyebrow">Personalized outreach</p>
              <strong className="mt-4 block text-3xl text-[var(--asu-maroon)]">{outreachSent}</strong>
              <p className="mt-3 text-sm leading-7 text-[var(--ink)]/70">
                Students who already have at least one message tied to a specific barrier.
              </p>
            </article>

            <article className="rounded-[1.7rem] border border-[rgba(140,29,64,0.1)] bg-[rgba(255,255,255,0.74)] p-5">
              <p className="eyebrow">Check-ins logged</p>
              <strong className="mt-4 block text-3xl text-[var(--asu-maroon)]">{checkInsLogged}</strong>
              <p className="mt-3 text-sm leading-7 text-[var(--ink)]/70">
                Hallway or after-class conversations captured so follow-up stays personal.
              </p>
            </article>

            <article className="rounded-[1.7rem] border border-[rgba(140,29,64,0.1)] bg-[rgba(255,255,255,0.74)] p-5">
              <p className="eyebrow">Follow-up queued</p>
              <strong className="mt-4 block text-3xl text-[var(--asu-maroon)]">{followUpsQueued}</strong>
              <p className="mt-3 text-sm leading-7 text-[var(--ink)]/70">
                Students who should get a second touch, not because they failed, but because week
                one is still unclear.
              </p>
            </article>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.14fr_0.86fr]">
          <section className="paper-card overflow-hidden">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[rgba(140,29,64,0.1)] pb-6">
              <div>
                <p className="eyebrow">Roster view</p>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--asu-maroon)]">
                  Students Who May Need A Lighter Touch
                </h2>
              </div>
              <span className="pill">Anonymized static mock</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.18em] text-[var(--muted-ink)]">
                    <th className="px-4 py-2">Student</th>
                    <th className="px-4 py-2">What faculty sees</th>
                    <th className="px-4 py-2">Support focus</th>
                    <th className="px-4 py-2">Last touch</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Review</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const selected = student.id === selectedStudentId;
                    return (
                      <tr
                        key={student.id}
                        className={`rounded-[1.4rem] transition ${
                          selected
                            ? "bg-[rgba(140,29,64,0.09)] shadow-[0_14px_32px_rgba(70,6,23,0.08)]"
                            : "bg-[rgba(255,255,255,0.76)]"
                        }`}
                      >
                        <td className="rounded-l-[1.4rem] px-4 py-4 align-top">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentId(student.id)}
                            className="text-left"
                          >
                            <strong className="block text-base text-[var(--asu-maroon)]">
                              {student.student}
                            </strong>
                            <span className="mt-1 block text-sm text-[var(--ink)]/68">
                              {student.year} · {student.major}
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-4 align-top text-sm leading-7 text-[var(--ink)]/78">
                          <p>{student.resourcePattern}</p>
                          <p className={`mt-2 text-xs uppercase tracking-[0.16em] ${concernClasses(student.concernLevel)}`}>
                            {student.concernLevel}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top text-sm leading-7 text-[var(--ink)]/78">
                          {student.supportFocus}
                        </td>
                        <td className="px-4 py-4 align-top text-sm leading-7 text-[var(--ink)]/72">
                          {student.lastTouch}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold tracking-[0.12em] uppercase ${statusClasses(student.status)}`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="rounded-r-[1.4rem] px-4 py-4 align-top">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentId(student.id)}
                            className={selected ? "button-gold" : "button-secondary"}
                          >
                            {selected ? "Open now" : "Review"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="maroon-panel">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-[var(--asu-gold)]">Selected student</p>
                  <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-tight text-[var(--warm-white)]">
                    {selectedStudent.student}
                  </h2>
                  <p className="mt-2 text-sm uppercase tracking-[0.15em] text-[rgba(255,251,245,0.64)]">
                    {selectedStudent.firstName} · {selectedStudent.pronouns}
                  </p>
                </div>
                <span className="rounded-full border border-[rgba(255,198,39,0.22)] bg-[rgba(255,255,255,0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--asu-gold)]">
                  {selectedStudent.status}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {selectedStudent.contextTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)] px-3 py-2 text-xs uppercase tracking-[0.14em] text-[rgba(255,251,245,0.76)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.07)] p-5">
                  <p className="eyebrow text-[var(--asu-gold)]">Faculty read</p>
                  <p className="mt-3 text-sm leading-7 text-[rgba(255,251,245,0.82)]">
                    {selectedStudent.supportFocus}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.07)] p-5">
                  <p className="eyebrow text-[var(--asu-gold)]">Personalized message preview</p>
                  <p className="mt-3 text-sm leading-7 text-[rgba(255,251,245,0.82)]">
                    {selectedStudent.messagePreview}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.07)] p-5">
                  <p className="eyebrow text-[var(--asu-gold)]">Check-in note preview</p>
                  <p className="mt-3 text-sm leading-7 text-[rgba(255,251,245,0.82)]">
                    {selectedStudent.checkInPreview}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => updateStudent(selectedStudent.id, "nudge")}
                  className="button-gold"
                >
                  Send personalized message
                </button>
                <button
                  type="button"
                  onClick={() => updateStudent(selectedStudent.id, "check-in")}
                  className="button-secondary"
                >
                  Log check-in
                </button>
                <button
                  type="button"
                  onClick={() => updateStudent(selectedStudent.id, "stable")}
                  className="button-secondary"
                >
                  Mark stable
                </button>
              </div>
            </section>

            <section className="paper-card">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[rgba(140,29,64,0.1)] pb-5">
                <div>
                  <p className="eyebrow">Helpful details</p>
                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-[var(--asu-maroon)]">
                    What To Ask Next
                  </h3>
                </div>
                <Link href={selectedStudent.recommendedLink.href} className="button-primary">
                  {selectedStudent.recommendedLink.label}
                </Link>
              </div>

              <div className="mt-6 grid gap-5">
                <article className="rounded-[1.5rem] border border-[rgba(140,29,64,0.1)] bg-[rgba(255,255,255,0.72)] p-5">
                  <p className="eyebrow">Recent signals</p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--ink)]/78">
                    {selectedStudent.recentSignals.map((signal) => (
                      <li key={signal}>{signal}</li>
                    ))}
                  </ul>
                </article>

                <article className="rounded-[1.5rem] border border-[rgba(140,29,64,0.1)] bg-[rgba(255,255,255,0.72)] p-5">
                  <p className="eyebrow">Suggested check-in prompts</p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--ink)]/78">
                    {selectedStudent.checkInPrompts.map((prompt) => (
                      <li key={prompt}>{prompt}</li>
                    ))}
                  </ul>
                </article>

                <article className="rounded-[1.5rem] border border-[rgba(140,29,64,0.1)] bg-[rgba(255,255,255,0.72)] p-5">
                  <p className="eyebrow">Strengths to name out loud</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {selectedStudent.strengths.map((strength) => (
                      <li
                        key={strength}
                        className="rounded-full bg-[rgba(140,29,64,0.08)] px-3 py-2 text-sm text-[var(--asu-maroon)]"
                      >
                        {strength}
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="rounded-[1.5rem] border border-[rgba(140,29,64,0.1)] bg-[rgba(255,198,39,0.12)] p-5">
                  <p className="eyebrow">Recommended next step</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink)]/78">
                    {selectedStudent.recommendedLink.note}
                  </p>
                </article>
              </div>
            </section>

            <section className="paper-card">
              <div className="border-b border-[rgba(140,29,64,0.1)] pb-5">
                <p className="eyebrow">Recent activity</p>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-[var(--asu-maroon)]">
                  Outreach Feed
                </h3>
              </div>

              <div className="mt-6 space-y-4">
                {activityFeed.map((item) => (
                  <article
                    key={`${item.title}-${item.stamp}`}
                    className="rounded-[1.4rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.72)] p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <strong className="text-[var(--asu-maroon)]">{item.title}</strong>
                      <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">
                        {item.stamp}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--ink)]/76">{item.detail}</p>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {toastMessage ? (
        <div className="toast paper-card">
          <p className="eyebrow">Faculty action saved</p>
          <p className="mt-3 text-sm leading-7 text-[var(--ink)]">{toastMessage}</p>
        </div>
      ) : null}
    </div>
  );
}
