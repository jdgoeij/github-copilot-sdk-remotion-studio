/**
 * Remotion Agent Skills — curated best-practice knowledge injected into the
 * LLM prompt so the generated component code follows Remotion idioms.
 *
 * Based on: https://github.com/remotion-dev/remotion/tree/main/packages/skills/skills/remotion/rules
 */

export type RemotionSkill = {
  id: string;
  name: string;
  /** Keywords / phrases that signal this skill is relevant. */
  triggers: string[];
  /** Markdown content injected into the system prompt. */
  content: string;
};

// ---------------------------------------------------------------------------
// Skill definitions
// ---------------------------------------------------------------------------

const animations: RemotionSkill = {
  id: "animations",
  name: "Animations",
  triggers: [
    "animat", "motion", "move", "fade", "scale", "rotat", "slide",
    "entrance", "exit", "appear", "disappear", "opacity"
  ],
  content: `## Remotion Animation Rules
- All animations MUST be driven by \`useCurrentFrame()\`.
- Write timings in seconds and multiply by fps from \`useVideoConfig()\`.
- CSS transitions/animations are FORBIDDEN — they will not render correctly.
- Tailwind animation class names are FORBIDDEN.

\`\`\`tsx
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();
const opacity = interpolate(frame, [0, 2 * fps], [0, 1], {
  extrapolateRight: "clamp",
});
\`\`\``
};

const timing: RemotionSkill = {
  id: "timing",
  name: "Timing & Easing",
  triggers: [
    "easing", "spring", "bounce", "smooth", "interpolat", "curve",
    "timing", "accelerat", "decelerat"
  ],
  content: `## Remotion Timing & Easing
### Linear interpolation
\`\`\`ts
import { interpolate } from "remotion";
const opacity = interpolate(frame, [0, 100], [0, 1], {
  extrapolateRight: "clamp",
  extrapolateLeft: "clamp",
});
\`\`\`

### Spring animations (natural motion)
\`\`\`ts
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
const frame = useCurrentFrame();
const { fps } = useVideoConfig();
const scale = spring({ frame, fps, config: { damping: 200 } }); // smooth, no bounce
\`\`\`

Common spring configs:
- Smooth, no bounce: \`{ damping: 200 }\`
- Snappy, minimal bounce: \`{ damping: 20, stiffness: 200 }\`
- Bouncy entrance: \`{ damping: 8 }\`
- Heavy, slow: \`{ damping: 15, stiffness: 80, mass: 2 }\`

### Easing curves
\`\`\`ts
import { interpolate, Easing } from "remotion";
const value = interpolate(frame, [0, 100], [0, 1], {
  easing: Easing.inOut(Easing.quad),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
\`\`\`

### Combining spring with interpolate
\`\`\`ts
const springProgress = spring({ frame, fps });
const rotation = interpolate(springProgress, [0, 1], [0, 360]);
\`\`\``
};

const transitions: RemotionSkill = {
  id: "transitions",
  name: "Scene Transitions",
  triggers: [
    "transition", "scene", "crossfade", "wipe", "flip", "slide between",
    "scene change", "cut between"
  ],
  content: `## Remotion Transitions (requires @remotion/transitions)
Use \`<TransitionSeries>\` for scene transitions.

\`\`\`tsx
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 15 })}
  />
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>
\`\`\`

Available transitions: \`fade\`, \`slide\`, \`wipe\`, \`flip\`, \`clockWipe\`.
Slide directions: \`"from-left"\`, \`"from-right"\`, \`"from-top"\`, \`"from-bottom"\`.

Transitions overlap scenes — total duration = sum of scenes minus transition durations.`
};

const sequencing: RemotionSkill = {
  id: "sequencing",
  name: "Sequencing",
  triggers: [
    "sequenc", "series", "one after another", "timeline", "delay",
    "stagger", "order", "arrange"
  ],
  content: `## Remotion Sequencing
Use \`<Sequence>\` to delay appearance and \`<Series>\` for sequential playback.

\`\`\`tsx
import { Sequence, Series, useVideoConfig } from "remotion";
const { fps } = useVideoConfig();

// Delayed appearance
<Sequence from={1 * fps} durationInFrames={2 * fps} premountFor={1 * fps}>
  <Title />
</Sequence>

// Sequential playback
<Series>
  <Series.Sequence durationInFrames={45}><Intro /></Series.Sequence>
  <Series.Sequence durationInFrames={60}><MainContent /></Series.Sequence>
  <Series.Sequence durationInFrames={30}><Outro /></Series.Sequence>
</Series>
\`\`\`

Always \`premountFor\` any \`<Sequence>\` to preload the component.
Inside a Sequence, \`useCurrentFrame()\` returns the local frame (starting from 0).`
};

const textAnimations: RemotionSkill = {
  id: "text-animations",
  name: "Text Animations",
  triggers: [
    "text", "typewriter", "typograph", "title", "heading", "word",
    "letter", "kinetic", "caption", "subtitle"
  ],
  content: `## Remotion Text Animations
- Use string slicing for typewriter effects. Never use per-character opacity.
- Drive all text animations from \`useCurrentFrame()\`.

### Typewriter
\`\`\`tsx
const frame = useCurrentFrame();
const { fps } = useVideoConfig();
const charsToShow = Math.floor(interpolate(frame, [0, 3 * fps], [0, text.length], {
  extrapolateRight: "clamp",
}));
return <div style={{ fontFamily: "monospace", fontSize: 48 }}>{text.slice(0, charsToShow)}</div>;
\`\`\`

### Fade-in word by word
\`\`\`tsx
const words = text.split(" ");
return (
  <div style={{ display: "flex", gap: 12 }}>
    {words.map((word, i) => {
      const opacity = interpolate(frame, [i * 8, i * 8 + 15], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      return <span key={i} style={{ opacity }}>{word}</span>;
    })}
  </div>
);
\`\`\``
};

const images: RemotionSkill = {
  id: "images",
  name: "Images",
  triggers: [
    "image", "photo", "picture", "img", "logo", "icon", "avatar",
    "thumbnail", "screenshot"
  ],
  content: `## Remotion Image Rules
- ALWAYS use the \`<Img>\` component from \`remotion\`.
- Do NOT use native \`<img>\`, Next.js \`<Image>\`, or CSS \`background-image\`.
- \`<Img>\` blocks rendering until the image is fully loaded (no flicker).

\`\`\`tsx
import { Img, staticFile } from "remotion";
<Img src={staticFile("photo.png")} style={{ width: 500, objectFit: "cover" }} />
\`\`\`

For data URLs (uploaded images):
\`\`\`tsx
<Img src={imageDataUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
\`\`\``
};

const charts: RemotionSkill = {
  id: "charts",
  name: "Charts & Data Viz",
  triggers: [
    "chart", "graph", "bar chart", "pie", "data viz", "visualiz",
    "stock", "line chart", "histogram", "donut"
  ],
  content: `## Remotion Chart Patterns
Disable all third-party chart library animations. Drive everything from \`useCurrentFrame()\`.

### Bar Chart (staggered spring)
\`\`\`tsx
const bars = data.map((item, i) => {
  const height = spring({ frame, fps, delay: i * 5, config: { damping: 200 } });
  return <div key={i} style={{ height: height * item.value, background: item.color }} />;
});
\`\`\`

### Pie Chart (stroke-dashoffset)
\`\`\`tsx
const progress = interpolate(frame, [0, 100], [0, 1]);
const circumference = 2 * Math.PI * radius;
const segmentLength = (value / total) * circumference;
const offset = interpolate(progress, [0, 1], [segmentLength, 0]);
<circle r={radius} cx={c} cy={c} fill="none" stroke={color}
  strokeDasharray={\`\${segmentLength} \${circumference}\`}
  strokeDashoffset={offset}
  transform={\`rotate(-90 \${c} \${c})\`} />
\`\`\`

### Line Chart (use @remotion/paths)
\`\`\`tsx
import { evolvePath } from "@remotion/paths";
const { strokeDasharray, strokeDashoffset } = evolvePath(progress, svgPath);
<path d={svgPath} fill="none" stroke="#FF3232" strokeWidth={4}
  strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
\`\`\``
};

const compositions: RemotionSkill = {
  id: "compositions",
  name: "Compositions",
  triggers: [
    "composition", "scene", "multi-scene", "intro", "outro",
    "segment", "part", "section"
  ],
  content: `## Remotion Composition Rules
- A \`<Composition>\` defines the renderable video (component, width, height, fps, durationInFrames).
- Use \`type\` declarations for props (not \`interface\`) for defaultProps type safety.

\`\`\`tsx
import { Composition } from "remotion";
<Composition id="MyVideo" component={MyVideo}
  durationInFrames={300} fps={30} width={1280} height={720}
  defaultProps={{ title: "Hello" }} />
\`\`\``
};

const trimming: RemotionSkill = {
  id: "trimming",
  name: "Trimming",
  triggers: [
    "trim", "cut", "clip", "shorten", "crop time"
  ],
  content: `## Remotion Trimming
### Trim the start (negative from)
\`\`\`tsx
<Sequence from={-0.5 * fps}><MyAnimation /></Sequence>
\`\`\`
### Trim the end
\`\`\`tsx
<Sequence durationInFrames={1.5 * fps}><MyAnimation /></Sequence>
\`\`\`
### Trim start + delay
\`\`\`tsx
<Sequence from={30}><Sequence from={-15}><MyAnimation /></Sequence></Sequence>
\`\`\``
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const ALL_SKILLS: RemotionSkill[] = [
  animations,
  timing,
  transitions,
  sequencing,
  textAnimations,
  images,
  charts,
  compositions,
  trimming
];

/**
 * Returns the subset of skills whose trigger words appear in the user prompt.
 * The `animations` and `timing` skills are always included as fundamentals.
 */
export function selectRelevantSkills(userPrompt: string): RemotionSkill[] {
  const lower = userPrompt.toLowerCase();
  const matched = new Set<string>(["animations", "timing"]); // always include fundamentals

  for (const skill of ALL_SKILLS) {
    if (matched.has(skill.id)) continue;
    for (const trigger of skill.triggers) {
      if (lower.includes(trigger)) {
        matched.add(skill.id);
        break;
      }
    }
  }

  return ALL_SKILLS.filter((s) => matched.has(s.id));
}

/**
 * Builds a combined markdown string from the selected skills,
 * ready to be appended to the system prompt.
 */
export function buildSkillsPromptSection(skills: RemotionSkill[]): string {
  if (skills.length === 0) return "";

  const header = [
    "",
    "=== REMOTION AGENT SKILLS (best practices — follow strictly) ===",
    `Loaded skills: ${skills.map((s) => s.name).join(", ")}`,
    ""
  ];

  const body = skills.map((s) => s.content);

  return [...header, ...body].join("\n\n");
}
