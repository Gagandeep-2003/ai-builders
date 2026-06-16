import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const toolLinks: Record<string, string> = {
  "AI Tools": "https://chat.openai.com/",
  "Bolt.new": "https://bolt.new/",
  Canva: "https://www.canva.com/",
  "Canva AI": "https://www.canva.com/ai/",
  "Canva Magic Media": "https://www.canva.com/ai-image-generator/",
  ChatGPT: "https://chat.openai.com/",
  Claude: "https://claude.ai/",
  ClawBot: "https://clawbot.ai/",
  ElevenLabs: "https://elevenlabs.io/",
  "Emergent.sh": "https://emergent.sh/",
  "Figma AI": "https://www.figma.com/ai/",
  Gamma: "https://gamma.app/",
  "Gamma AI": "https://gamma.app/",
  Gemini: "https://gemini.google.com/",
  "Gemini Playground": "https://aistudio.google.com/",
  "Google AI Studio": "https://aistudio.google.com/",
  "Google Whisk.ai": "https://labs.google/fx/tools/whisk/",
  Grammarly: "https://www.grammarly.com/",
  "Hugging Face": "https://huggingface.co/",
  Ideogram: "https://ideogram.ai/",
  "Kling AI": "https://klingai.com/",
  "Leonardo AI": "https://leonardo.ai/",
  "LM Studio": "https://lmstudio.ai/",
  MidJourney: "https://www.midjourney.com/",
  n8n: "https://n8n.io/",
  NotebookLM: "https://notebooklm.google.com/",
  "Notion AI": "https://www.notion.com/product/ai",
  Ollama: "https://ollama.com/",
  OpenAI: "https://chat.openai.com/",
  "OpenAI / Claude": "https://chat.openai.com/",
  "OpenAI GPTs": "https://chat.openai.com/gpts",
  Paperpal: "https://paperpal.com/",
  QuillBot: "https://quillbot.com/",
  "Reclaim AI": "https://reclaim.ai/",
  "Runway AI": "https://runwayml.com/",
  Sudowrite: "https://www.sudowrite.com/",
  "Suno AI": "https://suno.com/",
  Udio: "https://www.udio.com/",
  Zapier: "https://zapier.com/",
  ZeroGPT: "https://www.zerogpt.com/",
};

export function getToolUrl(tool: string) {
  return toolLinks[tool.trim()];
}

export function ToolLinkChip({
  tool,
  className,
}: {
  tool: string;
  className?: string;
}) {
  const href = getToolUrl(tool);
  const chipClassName = cn(
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] uppercase transition",
    href
      ? "border-accent/25 bg-accent/10 text-accent hover:border-accent/50 hover:bg-accent/15"
      : "border-border bg-white/[0.03] text-text-secondary",
    className,
  );

  if (!href) {
    return <span className={chipClassName}>{tool}</span>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={chipClassName}>
      {tool}
      <ExternalLink className="h-3 w-3" aria-hidden="true" />
    </a>
  );
}
