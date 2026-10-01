// "Drop them": the skill chips fall out of their cards and pile up with real physics (React Bits' FallingText idea).
// The chips can be grabbed and thrown. matter-js is only downloaded when this is first used.

type Stop = () => void;

export async function dropChips(area: HTMLElement): Promise<Stop> {
  const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint } = await import("matter-js");
  const box = area.getBoundingClientRect();
  const chips = [...area.querySelectorAll<HTMLElement>("[data-chip]")];
  area.style.height = `${box.height}px`;

  // Clones fall; the originals stay invisible in place so the cards keep their size.
  const layer = document.createElement("div");
  layer.style.cssText = "position:absolute;inset:0;z-index:20;pointer-events:none;";
  area.append(layer);
  const engine = Engine.create();
  engine.gravity.y = 1.1;
  const pairs = chips.map((chip) => {
    const r = chip.getBoundingClientRect();
    const clone = chip.cloneNode(true) as HTMLElement;
    clone.style.cssText = `position:absolute;left:0;top:0;width:${r.width}px;margin:0;pointer-events:auto;cursor:grab;touch-action:none;will-change:transform;`;
    clone.classList.add("chip-falling");
    layer.append(clone);
    chip.style.visibility = "hidden";
    const body = Bodies.rectangle(r.left - box.left + r.width / 2, r.top - box.top + r.height / 2, r.width, r.height, {
      chamfer: { radius: 6 },
      restitution: 0.35,
      friction: 0.3,
    });
    Body.setVelocity(body, { x: (Math.random() - 0.5) * 4, y: -Math.random() * 3 });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.12);
    return { clone, body, w: r.width, h: r.height };
  });
  const t = 60;
  const walls = [
    Bodies.rectangle(box.width / 2, box.height + t / 2, box.width + 2 * t, t, { isStatic: true }),
    Bodies.rectangle(-t / 2, box.height / 2, t, box.height * 3, { isStatic: true }),
    Bodies.rectangle(box.width + t / 2, box.height / 2, t, box.height * 3, { isStatic: true }),
  ];
  Composite.add(engine.world, [...walls, ...pairs.map((p) => p.body)]);

  // Grab and throw. The mouse listens on the layer; only the chips take pointer events, so the page still scrolls.
  const mouse = Mouse.create(layer);
  const m = mouse as unknown as { mousewheel: EventListener; element: HTMLElement };
  layer.removeEventListener("wheel", m.mousewheel);
  layer.removeEventListener("mousewheel", m.mousewheel);
  layer.removeEventListener("DOMMouseScroll", m.mousewheel);
  const grab = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
  Composite.add(engine.world, grab);

  let raf = 0;
  let last = performance.now();
  const frame = (now: number) => {
    Engine.update(engine, Math.min(32, now - last));
    last = now;
    for (const { clone, body, w, h } of pairs) {
      clone.style.transform = `translate(${body.position.x - w / 2}px, ${body.position.y - h / 2}px) rotate(${body.angle}rad)`;
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    Engine.clear(engine);
    layer.remove();
    chips.forEach((c) => (c.style.visibility = ""));
    area.style.height = "";
  };
}
