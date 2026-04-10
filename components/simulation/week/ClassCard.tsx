"use client";

import { CanvasNoticePanel } from "@/components/simulation/week/CanvasNoticePanel";
import { PanoramaPreview } from "@/components/simulation/week/PanoramaPreview";
import type { WeekClassEvent } from "@/lib/week-simulator-types";

interface ClassCardProps {
  event: WeekClassEvent;
  panoramaViewed: boolean;
  noticeRead: boolean;
  onViewPanorama: () => void;
  onReadNotice: () => void;
}

export function ClassCard({
  event,
  panoramaViewed,
  noticeRead,
  onViewPanorama,
  onReadNotice,
}: ClassCardProps) {
  return (
    <div className="grid gap-4">
      <div className="rounded-[1.8rem] border border-[#f0dbc6] bg-[#fff8ef] p-4 shadow-[0_16px_44px_rgba(44,17,22,0.08)] sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
              Class Event
            </p>
            <h3 className="mt-2 font-[var(--font-sim-display)] text-[1.75rem] leading-none text-[#2c1116]">
              {event.courseCode}
            </h3>
          </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold text-[#7d565b]">
            <span className="rounded-full bg-white px-3 py-1">Time · {event.time}</span>
            {event.linkedResource ? (
              <a
                href={event.linkedResource}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white px-3 py-1 transition hover:-translate-y-0.5 hover:text-[#8c1d40]"
              >
                Location · {event.location}
              </a>
            ) : (
              <span className="rounded-full bg-white px-3 py-1">Location · {event.location}</span>
            )}
            <span className="rounded-full bg-white px-3 py-1">Faculty · {event.facultyName}</span>
          </div>
        </div>

        <p className="mt-4 text-sm leading-7 text-[#6f4a4e]">{event.description}</p>

        <div className="mt-4 grid items-stretch gap-4 lg:grid-cols-2">
          <PanoramaPreview
            key={event.id}
            title={event.panoramaLabel}
            location={event.location}
            videoSrc={event.panoramaVideoSrc}
            viewed={panoramaViewed}
            onViewed={onViewPanorama}
          />
          <CanvasNoticePanel
            label={event.canvasLinkLabel}
            noticeText={event.noticeText}
            read={noticeRead}
            onRead={onReadNotice}
          />
        </div>
      </div>
    </div>
  );
}
