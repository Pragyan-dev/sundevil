import type {
  WeekBadgeDefinition,
  WeekDay,
  WeekDayId,
  WeekReminder,
  WeekSimulatorProgress,
} from "@/lib/week-simulator-types";

export const weekSimulatorBadges: WeekBadgeDefinition[] = [
  {
    id: "first-class-day",
    title: "First Class Day",
    description: "You finished your first class day and learned the rhythm of moving through campus.",
    icon: "🎒",
  },
  {
    id: "first-advising-session",
    title: "Advising Complete",
    description: "You walked into advising, asked questions, and left with a clearer plan.",
    icon: "🧭",
  },
  {
    id: "first-homework-scheduled",
    title: "Calendar Keeper",
    description: "You used the calendar to protect homework time before the deadline got loud.",
    icon: "🗓️",
  },
  {
    id: "first-professor-message",
    title: "Office Hours Reach-Out",
    description: "You sent a respectful message to a professor instead of waiting in uncertainty.",
    icon: "✉️",
  },
  {
    id: "first-resource-exploration",
    title: "Resource Explorer",
    description: "You turned free time into a support-finding side quest.",
    icon: "🗺️",
  },
  {
    id: "full-week-complete",
    title: "Week One Complete",
    description: "You practiced a full first week and made it feel far less mysterious.",
    icon: "🏆",
  },
];

export const weekResourceQuestIds = [
  "first-gen-support",
  "academic-advising",
  "tutoring",
  "financial-aid",
  "career-services",
  "counseling",
  "office-hours",
] as const;

export const weekSimulatorDays: WeekDay[] = [
  {
    id: "day-1",
    number: 1,
    title: "Day 1: First Class Run",
    shortTitle: "Classes",
    intro:
      "We are keeping today simple: find the rooms, meet the vibe, and learn what a normal class day actually feels like.",
    mascotExpression: "happy",
    storyBeat: "Three classes, a lot of new rooms, and the first real feeling of college rhythm.",
    events: [
      {
        id: "day1-mat101",
        dayId: "day-1",
        title: "MAT101",
        type: "class",
        time: "9:00 AM",
        description: "Intro math class. You mostly need the room, the professor cadence, and the notice board.",
        location: "PSH 153",
        courseCode: "MAT101",
        facultyName: "Prof. Elena Chavez",
        panoramaLabel: "Math hall panorama",
        panoramaVideoSrc: "/mat101-preview.mp4",
        noticeText:
          "Welcome to MAT101. Bring a notebook, check Canvas every Sunday night, and do not wait until the day homework is due to start it.",
        canvasLinkLabel: "Read professor notice",
        completionCondition: "Open the class and read the professor notice.",
      },
      {
        id: "day1-chem101",
        dayId: "day-1",
        title: "CHEM101",
        type: "class",
        time: "11:15 AM",
        description: "Lecture plus lab expectations. This one feels more manageable once you know the room and pace.",
        location: "ISTB4 110",
        courseCode: "CHEM101",
        facultyName: "Dr. Priya Raman",
        panoramaLabel: "Chem lecture preview",
        panoramaVideoSrc: "/chem101-preview.mp4",
        noticeText:
          "CHEM101 moves quickly. Review slides after class and bring at least one question to office hours if a concept stays fuzzy.",
        canvasLinkLabel: "Read professor notice",
        completionCondition: "Open the class and read the professor notice.",
      },
      {
        id: "day1-python",
        dayId: "day-1",
        title: "PYTHON",
        type: "class",
        time: "2:00 PM",
        description: "Your coding class. Expect demos, debugging, and a room full of laptops.",
        location: "COOR 174",
        courseCode: "PYTHON",
        facultyName: "Instructor Malik Gomez",
        panoramaLabel: "Python lab preview",
        panoramaVideoSrc: "/python-preview.mp4",
        noticeText:
          "For PYTHON, practice beats panic. Small daily check-ins with the material are better than one giant cram session.",
        canvasLinkLabel: "Read professor notice",
        completionCondition: "Open the class and read the professor notice.",
      },
    ],
  },
  {
    id: "day-2",
    number: 2,
    title: "Day 2: Advising at 10:00 AM",
    shortTitle: "Advising",
    intro:
      "Today is the part people overthink. Advising is not a test. It is a conversation that makes the path clearer.",
    mascotExpression: "idea",
    storyBeat: "A real appointment, a real question, and a better sense of what class planning is for.",
    events: [
      {
        id: "day2-advising",
        dayId: "day-2",
        title: "Academic Advising Appointment",
        type: "advising",
        time: "10:00 AM",
        description: "Check in, sit down, and learn what advising actually helps with.",
        location: "Centerpoint, Suite 105",
        advisorName: "Advisor Rivera",
        reminderLabel: "Appointment today at 10:00 AM",
        whatItsFor:
          "Advising helps with understanding degree progress, planning next semester, and catching issues before registration feels chaotic.",
        resources: [
          "Degree planning",
          "DARS help",
          "Registration questions",
          "Next-step referrals",
        ],
        conversation: {
          intro:
            "You made it. What feels most helpful to ask first: class planning, what DARS means, or how to avoid hidden problems later?",
          followUp:
            "Nice. That is exactly how advising gets useful fast: bring the confusing thing into the room instead of trying to decode it alone.",
          choices: [
            {
              id: "day2-plan",
              text: "class planning please",
              outcome: "Advisor Rivera sketches what matters now, what can wait, and how to build a semester that is ambitious without being brutal.",
              expression: "happy",
            },
            {
              id: "day2-dars",
              text: "can someone translate DARS",
              outcome: "The weird labels suddenly become simple categories and next steps instead of a wall of admin vocabulary.",
              expression: "idea",
            },
            {
              id: "day2-hidden",
              text: "i just want to avoid hidden problems later",
              outcome: "You leave with a short list of holds, habits, and deadlines that future-you will be grateful for.",
              expression: "smirk",
            },
          ],
        },
        completionCondition: "Finish the advising walkthrough.",
      },
    ],
  },
  {
    id: "day-3",
    number: 3,
    title: "Day 3: Classes, Homework, and Office Hours",
    shortTitle: "Momentum",
    intro:
      "This is where college starts to feel real: same classes, new homework, and a reason to actually use the calendar.",
    mascotExpression: "confused",
    storyBeat: "The schedule gets fuller, which is exactly when planning starts to matter.",
    events: [
      {
        id: "day3-mat101",
        dayId: "day-3",
        title: "MAT101 check-in",
        type: "class",
        time: "9:00 AM",
        description: "Second meeting of the week. The room already feels less intimidating.",
        location: "PSH 153",
        courseCode: "MAT101",
        facultyName: "Prof. Elena Chavez",
        panoramaLabel: "Math hall panorama",
        panoramaVideoSrc: "/mat101-preview.mp4",
        noticeText:
          "Homework 1 is now posted on Canvas and is due Sunday at 11:59 PM. Start before the weekend gets crowded.",
        canvasLinkLabel: "View homework",
        completionCondition: "Open the class and read the homework notice.",
      },
      {
        id: "day3-chem101",
        dayId: "day-3",
        title: "CHEM101 check-in",
        type: "class",
        time: "11:15 AM",
        description: "A quick lecture day. You hear the office-hours reminder at the end.",
        location: "ISTB4 110",
        courseCode: "CHEM101",
        facultyName: "Dr. Priya Raman",
        panoramaLabel: "Chem lecture preview",
        panoramaVideoSrc: "/chem101-preview.mp4",
        noticeText:
          "Office hours are next Tuesday from 1:00 PM to 3:00 PM. If you want to talk through lecture questions, send a short message first.",
        canvasLinkLabel: "Read office-hours note",
        completionCondition: "Open the class and read the professor notice.",
      },
      {
        id: "day3-python",
        dayId: "day-3",
        title: "PYTHON check-in",
        type: "class",
        time: "2:00 PM",
        description: "Another coding class, this time with less guesswork about where to sit and what to expect.",
        location: "COOR 174",
        courseCode: "PYTHON",
        facultyName: "Instructor Malik Gomez",
        panoramaLabel: "Python lab preview",
        panoramaVideoSrc: "/python-preview.mp4",
        noticeText:
          "Tiny practice blocks help most in PYTHON. Keep a note of one thing you understood today and one thing you want to ask later.",
        canvasLinkLabel: "Read professor notice",
        completionCondition: "Open the class and read the professor notice.",
      },
      {
        id: "day3-homework-plan",
        dayId: "day-3",
        title: "Schedule math homework",
        type: "homework",
        time: "4:30 PM",
        description: "MAT101 homework is due Sunday. Put real time on the calendar before the week gets noisier.",
        location: "Calendar view",
        courseCode: "MAT101",
        dueDayId: "day-7",
        dueTime: "11:59 PM",
        canvasLinkLabel: "Check due date",
        completionCondition: "Open the calendar and schedule work for Thursday.",
      },
      {
        id: "day3-office-hours-message",
        dayId: "day-3",
        title: "Message CHEM101 professor",
        type: "message",
        time: "5:15 PM",
        description: "Ask politely about next Tuesday's office hours so the visit feels easy instead of awkward.",
        location: "Draft message",
        facultyName: "Dr. Priya Raman",
        suggestedTemplates: [
          "Hi Dr. Raman, I am in CHEM101 and would love to stop by office hours next Tuesday to ask about this week's material. Would that be okay?",
          "Hello Dr. Raman, I am reviewing lecture notes and have a couple of questions. May I come to your office hours next Tuesday?",
          "Hi Dr. Raman, I am in your CHEM101 class and would appreciate a quick office-hours conversation next Tuesday about the recent lecture. Thank you!",
        ],
        completionCondition: "Send a short respectful message asking for an office-hours appointment.",
      },
    ],
  },
  {
    id: "day-4",
    number: 4,
    title: "Day 4: Homework Block",
    shortTitle: "Thursday",
    intro:
      "The reminder is here for a reason. Today is about keeping the promise you made to future-you on the calendar.",
    mascotExpression: "idea",
    storyBeat: "A planned homework block feels much calmer than a surprise emergency.",
    events: [
      {
        id: "day4-homework-session",
        dayId: "day-4",
        title: "Math homework work session",
        type: "homework",
        time: "Scheduled slot",
        description: "Use the saved Thursday slot to make real progress on the assignment.",
        location: "Library quiet floor",
        courseCode: "MAT101",
        dueDayId: "day-7",
        dueTime: "11:59 PM",
        canvasLinkLabel: "View homework",
        completionCondition: "Check the reminder and confirm you used the scheduled slot.",
      },
    ],
  },
  {
    id: "day-5",
    number: 5,
    title: "Day 5: Free Day, Smart Side Quest",
    shortTitle: "Friday",
    intro:
      "You have a little breathing room today. That is the perfect time to explore support before you desperately need it.",
    mascotExpression: "happy",
    storyBeat: "Free time becomes useful when it turns into low-pressure resource discovery.",
    events: [
      {
        id: "day5-resource-run",
        dayId: "day-5",
        title: "Explore resource worlds",
        type: "resource",
        time: "Flexible",
        description: "Pick a campus support world and play through it while the stakes are low.",
        location: "Campus map",
        resourceWorldIds: [...weekResourceQuestIds],
        completionCondition: "Launch at least one resource simulation.",
      },
    ],
  },
  {
    id: "day-6",
    number: 6,
    title: "Day 6: Saturday Reset",
    shortTitle: "Saturday",
    intro:
      "Rest is part of school too. A calm reset day makes the rest of the week feel less chaotic.",
    mascotExpression: "smirk",
    storyBeat: "No drama today. Just enough structure to make Sunday easier.",
    events: [
      {
        id: "day6-reset",
        dayId: "day-6",
        title: "Weekend reset",
        type: "free-day",
        time: "Flexible",
        description: "Choose how you want to use a lighter day before the deadline returns tomorrow.",
        location: "Wherever feels calm",
        choices: [
          {
            id: "day6-reset-plan",
            text: "tidy up notes and get ready for sunday",
            outcome: "That small reset lowers the volume on tomorrow immediately.",
            expression: "happy",
          },
          {
            id: "day6-reset-rest",
            text: "rest on purpose so next week starts cleaner",
            outcome: "Also valid. Rest counts more when it is intentional and not just accidental avoidance.",
            expression: "smirk",
          },
        ],
        completionCondition: "Pick a low-pressure reset move for Saturday.",
      },
    ],
  },
  {
    id: "day-7",
    number: 7,
    title: "Day 7: Sunday Due Date",
    shortTitle: "Sunday",
    intro:
      "Deadline day. Not panic day. You already scheduled the work, so now this is just a final check and submit.",
    mascotExpression: "anxious",
    storyBeat: "The urgent reminder lands softer when the week already had structure.",
    events: [
      {
        id: "day7-submit-homework",
        dayId: "day-7",
        title: "Submit MAT101 homework",
        type: "deadline",
        time: "Before 11:59 PM",
        description: "Check the due date, open Canvas, and send the assignment in.",
        location: "Canvas",
        courseCode: "MAT101",
        canvasLinkLabel: "Check due date",
        completionCondition: "Confirm the due date and submit the assignment.",
      },
    ],
  },
];

export function createWeekSimulatorProgress(): WeekSimulatorProgress {
  return {
    selectedDayId: "day-1",
    completedDayIds: [],
    openedEventIds: [],
    completedEventIds: [],
    readNoticeIds: [],
    viewedPanoramaIds: [],
    acknowledgedReminderIds: [],
    exploredResourceWorldIds: [],
    points: 0,
    earnedBadgeIds: [],
    scheduledHomeworkSlot: null,
    professorMessageDraft: "",
    professorMessageSent: false,
    professorMessageSentAt: null,
    calendarOpened: false,
    submittedHomework: false,
  };
}

export function isWeekSimulatorProgress(value: unknown): value is WeekSimulatorProgress {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<WeekSimulatorProgress>;

  return (
    typeof candidate.selectedDayId === "string" &&
    Array.isArray(candidate.completedDayIds) &&
    Array.isArray(candidate.openedEventIds) &&
    Array.isArray(candidate.completedEventIds) &&
    Array.isArray(candidate.readNoticeIds) &&
    Array.isArray(candidate.viewedPanoramaIds) &&
    Array.isArray(candidate.acknowledgedReminderIds) &&
    Array.isArray(candidate.exploredResourceWorldIds) &&
    typeof candidate.points === "number" &&
    Array.isArray(candidate.earnedBadgeIds) &&
    "scheduledHomeworkSlot" in candidate &&
    typeof candidate.professorMessageDraft === "string" &&
    typeof candidate.professorMessageSent === "boolean" &&
    typeof candidate.calendarOpened === "boolean" &&
    typeof candidate.submittedHomework === "boolean"
  );
}

export function getWeekDay(dayId: WeekDayId) {
  return weekSimulatorDays.find((day) => day.id === dayId) ?? null;
}

export function getDayUnlockState(progress: WeekSimulatorProgress, dayId: WeekDayId) {
  const dayIndex = weekSimulatorDays.findIndex((day) => day.id === dayId);
  if (dayIndex <= 0) {
    return true;
  }

  return progress.completedDayIds.includes(weekSimulatorDays[dayIndex - 1].id);
}

export function getWeekReminders(progress: WeekSimulatorProgress): WeekReminder[] {
  const reminders: WeekReminder[] = [];

  reminders.push({
    id: "day2-advising-reminder",
    dayId: "day-2",
    time: "9:15 AM",
    message: "Advising at 10:00 AM. Bring your questions and the confusing stuff.",
    sourceEventId: "day2-advising",
    actionLabel: "Open advising",
  });

  if (progress.scheduledHomeworkSlot) {
    reminders.push({
      id: "day4-homework-today",
      dayId: progress.scheduledHomeworkSlot.dayId,
      time: progress.scheduledHomeworkSlot.timeLabel,
      message: `Math homework on ${progress.scheduledHomeworkSlot.dateLabel} at ${progress.scheduledHomeworkSlot.timeLabel}.`,
      sourceEventId: "day4-homework-session",
      actionLabel: "Open homework plan",
    });
  }

  reminders.push({
    id: "day7-homework-due",
    dayId: "day-7",
    time: "7:30 PM",
    message: "Math homework is due tonight. You already did the hard part, now just close it out.",
    sourceEventId: "day7-submit-homework",
    actionLabel: "Open deadline",
  });

  return reminders;
}
