import { ArrowUpRight, Bot, Sparkles } from "lucide-react";

const assistants = [
  {
    name: "ChatGPT",
    description: "OpenAI's helpful AI assistant",
    url: "https://chatgpt.com",
    badge: "GPT",
    className: "chatgpt",
  },
  {
    name: "Gemini",
    description: "Google's AI assistant",
    url: "https://gemini.google.com",
    badge: "G",
    className: "gemini",
  },
  {
    name: "Claude",
    description: "Anthropic's intelligent assistant",
    url: "https://claude.ai",
    badge: "AI",
    className: "claude",
  },
];

function AssistantPanel() {
  return (
    <article className="dashboard-card assistant-panel">
      <div className="dashboard-card__header">
        <div>
          <h3>AI Assistants</h3>
          <p>Continue with your preferred assistant</p>
        </div>

        <div className="assistant-panel__header-icon">
          <Bot size={21} />
        </div>
      </div>

      <div className="assistant-list">
        {assistants.map((assistant) => (
          <a
            key={assistant.name}
            href={assistant.url}
            target="_blank"
            rel="noreferrer"
            className={`assistant-item assistant-item--${assistant.className}`}
          >
            <div className="assistant-item__logo">{assistant.badge}</div>

            <div className="assistant-item__content">
              <strong>{assistant.name}</strong>
              <span>{assistant.description}</span>
            </div>

            <div className="assistant-item__arrow">
              <ArrowUpRight size={18} />
            </div>
          </a>
        ))}
      </div>

      <a
        className="assistant-panel__footer"
        href="https://chatgpt.com"
        target="_blank"
        rel="noreferrer"
      >
        Explore AI Assistants
        <Sparkles size={17} />
      </a>
    </article>
  );
}

export default AssistantPanel;