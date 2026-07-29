import {
  Clock3,
  Files,
  HardDrive,
  Star,
} from "lucide-react";
import { useMemo } from "react";

import { useFiles } from "../../hooks/useFiles";
import type { CloudFile } from "../../types/file";

interface StatCard {
  label: string;
  value: string;
  helper: string;
  icon: typeof Files;
  variant: "blue" | "pink" | "sand" | "mist";
}

function getFileRecord(
  file: CloudFile,
): Record<string, unknown> {
  return file as unknown as Record<string, unknown>;
}

function getFileSize(file: CloudFile): number {
  const record = getFileRecord(file);

  const size =
    record.sizeInBytes ??
    record.fileSize ??
    record.size;

  if (typeof size === "number") {
    return size;
  }

  if (
    typeof size === "string" &&
    !Number.isNaN(Number(size))
  ) {
    return Number(size);
  }

  return 0;
}

function getTimestamp(file: CloudFile): number {
  const record = getFileRecord(file);

  const rawDate =
    record.createdAt ??
    record.uploadedAt ??
    record.updatedAt ??
    record.created_at ??
    record.uploaded_at ??
    record.updated_at;

  if (typeof rawDate !== "string") {
    return 0;
  }

  const timestamp = new Date(rawDate).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}

function isFavorite(file: CloudFile): boolean {
  const record = getFileRecord(file);

  return (
    record.isFavorite === true ||
    record.favorite === true
  );
}

function formatFileSize(bytes: number): string {
  if (bytes <= 0) {
    return "0 B";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  const mb = kb / 1024;

  if (mb < 1024) {
    return `${mb.toFixed(1)} MB`;
  }

  const gb = mb / 1024;

  return `${gb.toFixed(2)} GB`;
}

function StatCards() {
  const { files, isLoading } = useFiles();

  const stats = useMemo<StatCard[]>(() => {
    const weekAgo =
      Date.now() -
      7 * 24 * 60 * 60 * 1000;

    const totalStorage = files.reduce(
      (total, file) =>
        total + getFileSize(file),
      0,
    );

    const favorites = files.filter(
      isFavorite,
    ).length;

    const uploadsThisWeek = files.filter(
      (file) =>
        getTimestamp(file) >= weekAgo,
    ).length;

    return [
      {
        label: "Total Files",
        value: files.length.toString(),
        helper: `${files.length} stored in CloudNest`,
        icon: Files,
        variant: "blue",
      },
      {
        label: "Favorites",
        value: favorites.toString(),
        helper: "Marked as favourite",
        icon: Star,
        variant: "pink",
      },
      {
        label: "Storage Used",
        value: formatFileSize(
          totalStorage,
        ),
        helper: "Current usage",
        icon: HardDrive,
        variant: "sand",
      },
      {
        label: "Recent Uploads",
        value: uploadsThisWeek.toString(),
        helper: "Last 7 days",
        icon: Clock3,
        variant: "mist",
      },
    ];
  }, [files]);

  return (
    <section
      className="stat-grid"
      aria-label="Cloud statistics"
    >
      {stats.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.label}
            className={`stat-card stat-card--${card.variant}`}
          >
            <div className="stat-card__top">
              <div className="stat-card__icon">
                <Icon
                  size={22}
                  strokeWidth={1.8}
                />
              </div>
            </div>

            <p className="stat-card__label">
              {card.label}
            </p>

            <h3>
              {isLoading
                ? "..."
                : card.value}
            </h3>

            <p className="stat-card__helper">
              {isLoading
                ? "Loading..."
                : card.helper}
            </p>
          </article>
        );
      })}
    </section>
  );
}

export default StatCards;