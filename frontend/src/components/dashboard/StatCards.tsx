import {
  Clock3,
  Files,
  HardDrive,
  Star,
  TrendingUp,
} from "lucide-react";

const statistics = [
  {
    label: "Total Files",
    value: "248",
    helper: "+18 this week",
    icon: Files,
    variant: "blue",
  },
  {
    label: "Favorites",
    value: "56",
    helper: "+7 this week",
    icon: Star,
    variant: "pink",
  },
  {
    label: "Storage Used",
    value: "2.4 GB",
    helper: "of 5 GB",
    icon: HardDrive,
    variant: "sand",
  },
  {
    label: "Recent Uploads",
    value: "12",
    helper: "this week",
    icon: Clock3,
    variant: "mist",
  },
];

function StatCards() {
  return (
    <section className="stat-grid" aria-label="Storage statistics">
      {statistics.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.label}
            className={`stat-card stat-card--${item.variant}`}
          >
            <div className="stat-card__top">
              <div className="stat-card__icon">
                <Icon size={22} strokeWidth={1.9} />
              </div>

              <span className="stat-card__trend">
                <TrendingUp size={15} />
              </span>
            </div>

            <p className="stat-card__label">{item.label}</p>

            <h3>{item.value}</h3>

            <p className="stat-card__helper">{item.helper}</p>

            {item.label === "Storage Used" && (
              <div className="stat-card__progress">
                <span />
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}

export default StatCards;