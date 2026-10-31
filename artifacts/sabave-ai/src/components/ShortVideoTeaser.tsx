import { Lock, Play } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const HINT = 'Coming soon: turns this campaign into a short vertical video';

export function ShortVideoTeaser({ headline }: { headline: string }) {
  return (
    <section className="video-teaser" aria-labelledby="video-teaser-title" data-testid="short-video-teaser">
      <div className="video-teaser-frame" aria-hidden="true">
        <Play size={18} fill="currentColor" />
        <span>{headline}</span>
      </div>
      <div className="video-teaser-body">
        <strong id="video-teaser-title"><Lock size={13} aria-hidden="true" />Short video for TikTok &amp; Reels</strong>
        <span className="status-chip s-draft">Coming soon</span>
        <Tooltip>
          {/* A disabled button fires no hover or focus events, so the wrapper carries the tooltip. */}
          <TooltipTrigger asChild>
            <span className="video-teaser-action" tabIndex={0} aria-label={HINT}>
              <button type="button" className="action-btn small" disabled data-testid="button-create-video">Create 15-second video</button>
            </span>
          </TooltipTrigger>
          <TooltipContent>{HINT}</TooltipContent>
        </Tooltip>
      </div>
    </section>
  );
}
