import { CalendarDays, TrendingDown, Wind } from 'lucide-react';
import type { WeatherAlert } from '@workspace/api-client-react';

function shortDate(date: string) {
  const value = new Date(date.length === 10 ? `${date}T12:00:00` : date);
  if (Number.isNaN(value.getTime())) return date;
  return new Intl.DateTimeFormat('en-MY', { weekday: 'short', day: 'numeric', month: 'short' }).format(value);
}

export function AlertCard({ alert, city, salesDipPct }: { alert: WeatherAlert; city: string; salesDipPct?: number }) {
  const ahead = alert.daysAhead <= 0 ? 'Starting today' : alert.daysAhead === 1 ? 'Starts in 1 day' : `Starts in ${alert.daysAhead} days`;
  return (
    <section className="alert-card" role="status" data-testid="alert-card">
      <div className="alert-head">
        <div className="alert-icon"><Wind size={20} strokeWidth={1.8} /></div>
        <div>
          <div className="info-label alert-label">Haze warning · {city}</div>
          <h3 data-testid="alert-severity">{alert.peakLevelLabel} haze expected</h3>
        </div>
        <span className="alert-ahead" data-testid="alert-days-ahead">{ahead}</span>
      </div>
      <div className="alert-body">
        <div className="alert-fact">
          <CalendarDays size={15} />
          <div>
            <span>Affected dates</span>
            <div className="alert-dates" data-testid="alert-dates">
              {alert.affectedDates.map((d) => <i key={d} className={d === alert.peakDate ? 'peak' : ''}>{shortDate(d)}</i>)}
            </div>
          </div>
        </div>
        <div className="alert-fact">
          <TrendingDown size={15} />
          <div>
            <span>Last time bad weather hit</span>
            <strong data-testid="alert-sales-dip">
              {typeof salesDipPct === 'number' ? `Sales dipped ${salesDipPct}%` : 'Sales dip not recorded'}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}
