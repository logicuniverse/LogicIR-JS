# Beyond the Tape: Logic as Topology, Not Sequence

**Author**: Yang Zhang

---

## Abstract

Programming still represents logic primarily as a one-dimensional sequence. That habit has shaped not only how software is written, but how software is imagined. The result is a recurring structural burden: concerns that working systems keep distinct in practice are flattened into the same textual medium and then reconstructed through diagrams, conventions, frameworks, and surrounding tooling.

This essay proposes a different frame. Instead of treating logic primarily as sequence, it treats logic as topology. It introduces a tri-axial model in which a logic unit is described through interaction, manifestation, and requirement fulfillment, so that boundary drive, current-layer form, and supplying relations can be distinguished rather than collapsed into one textual sequence.

The argument then rereads familiar paradigm fragmentation through that model and introduces LogicIR as its representational consequence: a logic-as-data substrate in which topology, boundary semantics, and fulfillment can be stated directly. LogicIR is not proposed as the runtime itself, but as a representation layer that runtimes, tools, and projections consume. In this frame, code remains indispensable as local realization, but no longer has to be the only official logical source of truth.

The claim is deliberately bounded. This essay does not offer a formal proof, a finished specification, or a production-readiness argument. It offers a non-trivial but incomplete proposal: that some of software's recurring structural problems may be better understood as consequences of representational collapse, and that a more topology-faithful medium may therefore be worth taking seriously.

# 1. A Pattern That Will Not Go Away

Non-trivial software almost never lives in source files alone. Somewhere beside the repository, a second body begins to accumulate: an architecture sketch in a design doc, a state diagram on a whiteboard, a dependency graph exported before a risky refactor, a queue flow somebody had to draw because the code alone would not confess what depended on what. Teams treat these artifacts as auxiliary, but they do not behave like auxiliary things. They appear early, they return under stress, and once a system becomes large enough, nobody serious wants to work without them.

That second body exists for a simple reason: the running body of the system is not the same thing as the legible body of the system. Code keeps the official status because it executes, versions cleanly, and can be tested. But engineers rarely reason about a non-trivial system by reading it as a long obedient stream of text. They reason by reconstructing boundaries, flows, transitions, ownership, and dependency shape around the text.

A weaker version of the same linear limit appears even in long-form prose: once an argument grows large enough, headings, numbering, footnotes, and cross-references become necessary to keep distant parts in view at once. Software is harsher because the same line must not only be read, but executed. The machine gets one body. The humans responsible for the machine quietly build another. When those two diverge, we usually blame the diagram for drifting. More often the deeper problem is that the structure it was trying to preserve never had first-class representational status to begin with.

That is why a risky refactor so often begins with improvised cartography. Before anyone touches the code, somebody exports a dependency graph, somebody else sketches the queue flow, somebody opens a whiteboard to trace state transitions, and everybody discovers that no single view is trustworthy enough to carry the whole change alone. The code is too implicit to move in confidence, but the surrounding diagrams are also partial and mismatched. One view shows dependency shape but hides timing. Another shows process flow but drops ownership. A third makes the modules legible while flattening the actual transitions that make them dangerous to change. Existing drawing tools help, but only by preserving one slice of the logic at a time. Even the unofficial second body rarely has a medium accurate enough to hold the whole structure directly.

The same pressure shows up far beyond diagrams. Software engineering keeps reinventing local repairs that look different on the surface but feel oddly familiar underneath: dependency injection to separate source from use site, effect systems to stop consequences from dissolving into ordinary calls, reactive streams to recover visible flow, actor models to recover message structure, orchestration layers to recover process shape, component scaffolds to recover boundaries that plain code does not keep stable on its own. These are not random fashions and they are not failed ideas. Most are useful. Some are indispensable in the right place. But their recurrence is the point. The field keeps rebuilding structure around code as though some part of the logical shape were repeatedly falling through the official medium.

So the main question of this essay is not which paradigm should win, nor which framework made the least bad local compromise. The more interesting question is why this unofficial second body keeps reappearing at all, and why so many apparently different engineering traditions keep converging on the same kind of compensatory work. A pattern this recurrent deserves a stronger explanation than "software is complicated." Different traditions keep naming different local villains, yet they keep generating the same family of repairs: visible boundaries, visible flow, visible process shape, visible ownership, visible effect shape. That regularity is hard to dismiss as taste or fashion. It suggests that the field is not merely accumulating techniques, but reacting over and over to the same underlying representational pressure.

This is not mainly a story about bad taste, weak discipline, or accidental language history. It is a story about representation. The thing we keep treating as supplementary may be closer to the missing logical structure than the official text is. Before arguing over paradigms, we should ask a simpler question: why does the official medium keep forcing so much structure to return through unofficial channels in the first place? Software has been forcing a richer logical shape through a one-dimensional medium, and the result is not just inconvenience but a recurring structural tax.

# 2. What Text Does to Logic

That pressure begins one layer lower than language design or framework taste. It begins in the representational bias of the medium itself.

## Sequence Bias

Text has a native affinity for sequence. One-dimensional source text lays logic out as an ordered stream. The request-shaped call becomes its most natural local gesture. That gives text unusual strength at preserving temporal unfolding and pull-shaped access. Neither of those is fake. Software really does unfold in time, and values really are requested, sampled, and returned.

That fit, however, is narrower than it first appears. Text is most comfortable with time when time itself can be narrated as one forward pass. The moment control may branch, loop, skip ahead, or re-enter from elsewhere, the visible line stops being a faithful picture of temporal structure. Even fully synchronous code already needs hidden control state to determine which path is live, whether a return site will be revisited, and how long a local sequence is really local for. Async and push-driven systems do not create that mismatch from nothing. They intensify a representational mismatch that was already present.

The deeper problem is that this mismatch is not limited to unusual control flow. A medium that preserves sequence and pull unusually well will first underexpress what is less naturally serial and less naturally request-shaped: compositional structure, externally driven response, and logic spread across events, resumptions, emissions, joins, and obligations that are only partly ordered rather than one line long. Software bears a particularly harsh version of that pressure because the same representation must not only be read, but also scheduled and executed. Some relations travel through the medium with high fidelity. Others arrive flattened, displaced, or only partially visible.

Over time, the bias stopped feeling like a bias at all. It was reinforced by instruction-stream machines, file-centered tooling, and the habit of treating logic as something fetched, stepped through, and stored as a line. The result is not merely that text describes some structures more comfortably than others. What fits the line begins to look like logic's natural form. What does not fit is pushed outward into "special cases," framework machinery, or after-the-fact explanation.

Text is so good at serializing complex behavior into one local thread that it encourages us to mistake schedulability for clarity. Logic can be made to run before its real structure has been made legible.

Non-trivial software is therefore not difficult for text merely because it is large. It is difficult because much of its structure is compositional and responsive rather than purely sequential. A piece of logic may be partly sampled on demand, partly resumed by outside completion, partly joined with sibling work, and partly gated by durable boundaries or effect constraints. Those are not all one kind of relation. Some are causal. Some are structural. Some are temporal. Some concern which outside capability must be made available before local logic can work. Text, however, has one cheap universal move for all of them: put one thing after another.

Text imposes order even where the logic does not naturally have that much order. Even a pure expression is usually a tree, not a tape: sibling branches may be semantically independent and therefore naturally parallel, yet text still makes them arrive as one ordered stream. Later stages may recover some of that freedom, but only by undoing a serialization the medium imposed first.

The same pattern repeats at larger scales. Composition becomes nesting or call order. Response becomes callback attachment or an awaited continuation. Coordination becomes scheduler logic or framework lifecycle surrounding an apparently local thread. A needed capability and the logic that supplies it begin to appear as just another nearby name or parameter. Text keeps translating structural relations into scheduling relations, because scheduling is what the line can express cheaply. It schedules structure first and leaves the reader to reconstruct structure later. The result is runnable compression: structure that was not inherently one sequence made to pass through one sequence anyway.

## Success Hides the Loss

That is why the problem hides so well. Text does not need to preserve original structure in order to make the machine behave acceptably; it only needs a schedule the runtime can execute. Success therefore masks loss. The logic may actually depend on resumed work, fan-out and joins, durable boundaries, replacement assumptions, or the presence of particular capabilities, yet the code can still present itself as one advancing thread plus some auxiliary scaffolding.

What has been lost is not execution. What has been lost is visible separation between questions that should have remained distinct. Where does control really enter? What is local transformation, and what is boundary crossing? What may proceed independently? What must remain ordered?

The same collapse obscures another class of question as well. Is something merely data flowing through a boundary, or a needed capability being supplied from elsewhere? Which supplying relation is actually in force? When a nearby edit looks local, is it substituting a value, or changing the logic that the local structure relies on?

Asynchronous programming is the clearest stress case. `await` is powerful precisely because it re-serializes one narrow slice of response-shaped behavior into the syntax of local continuation. It gives back a piece of readability by pretending one suspended response is still one nearby thread. But what does not fit that slice does not disappear. It leaks outward into tasks, streams, queues, retries, cancellation paths, and framework lifecycle rules. The visible code remains locally readable while the real logic is distributed across a wider response topology. Push and async are not pathological here; they are where the medium's bias becomes hardest to ignore. The machine can still run the result. The reader now has to reconstruct the missing geometry. That is hidden coupling: structure preserved only indirectly through execution order, ambient context, and auxiliary conventions.

The same loss can be stated another way. In many engineering situations, what we really need is not merely a recipe for producing behavior, but the dish itself: a stable object that can be inspected, compared, constrained, or discussed before the system is already in motion. We want to know what depends on what, which capability is being relied on where, which boundaries exist, and which transitions are permitted. Text often gives us the recipe instead: an ordered procedure whose full structural consequences are only realized while it is being executed.

That substitution matters because many questions then become runtime questions by default. Some dynamism is real and unavoidable. But much of it is accidental, introduced by the representational habit of describing how to assemble structure instead of presenting enough of the structure directly. Facts that could have been fixed, checked, or understood earlier remain suspended until execution: which supplying relation is actually in force, which branch is live, which state boundary has already been crossed, which effect may now fire, even whether a boundary is carrying plain data or a context-bearing capability. Text does not merely describe dynamic systems. It turns many statically knowable questions into runtime discoveries, and with that deferral comes unnecessary timing and state risk.

The loss does not stop at runtime deferral. The recipe is also written in the dialect of a host language, its runtime, and its toolchain. That matters because a relation that should remain the same logical object across environments is repeatedly restated in local idioms instead. In one place it appears as callbacks, in another as promises, elsewhere as traits or lifecycle hooks. Even simple invariants inherit host ceremony. Reuse narrows because what should have been projected gets rewritten. Portability becomes less a matter of carrying one logic object across targets than of reauthoring similar intent under each target's expressive limits.

The same indirectness also degrades structural tracking. Text gives names and scopes, but not first-class structural identity or coordinates. What should have been tracked as position, boundary, needed capability, or supplying relation is therefore tracked indirectly through variable names, file placement, conventions, object references, and runtime handles. File trees, folders, import graphs, and relative paths are then forced to do structural work they were never meant to do. The code may run without making any of that explicit, but the moment it must be inspected, moved, or safely changed, that missing structure has to be reconstructed by hand.

## When Code Must Become Thinkable

The cost is paid when the code must become a unit of thought rather than merely a unit of execution. Inline, the compressed thread can look harmless. The reader is willing to follow the same line the machine follows. The trouble starts when the code must be named, moved, reused, or safely modified. Then the missing separations reassert themselves. In a linear stream, even small surface edits can carry disproportionate semantic force, because ordering, coordination, and structure have all been made to hitchhike on the same textual fabric. A moved line may not only move a line. It may shift a synchronization point, alter an effect boundary, change what is observed before durability is established, or force one branch to wait for another that was previously only adjacent in text. Many of the hardest bugs in textual systems live exactly here: not in the obvious algorithm, but in a hidden change of timing, state visibility, or effect order that the representation never kept legible in the first place.

Text also makes change itself structurally lossy. The official thing being edited is a stream, so the primitive act of modification is usually a character edit, token edit, line edit, or pasted block, not a bounded transformation of a declared logical unit. A missing delimiter, one stray semicolon, one shifted indent, or one reordered fragment can therefore break parsing, trigger compile failure, or worse, leave the program apparently valid while quietly changing behavior or opening a vulnerability. Text diff is useful, but it compares stream deltas, not logic deltas. It does not by itself prove that two edits touched independent logic, that a review covered the right semantic boundary, or that a tiny delta did not cross some hidden timing, state, or effect invariant. Even provenance degrades. Instead of asking cleanly who changed this transition, this boundary, or this supplying relation, teams reconstruct line history across files and hope the mapping back to logic is still recoverable. The medium records edits to text directly. It records edits to logic only indirectly.

A function boundary in text is supposed to isolate one coherent operation. But once sequence has been doing double duty for composition, response, resource binding, outside capability supply, and temporal commitment, the extracted function often exports a packed set of obligations instead.

Callers then inherit not just behavior, but assumptions about who drives resumption, what may happen concurrently, which effects must remain ordered, what context must already be present, and which compatible logic is really being relied on. A small pure helper is not the problem. The sharper problem is a callable that looks self-contained while dragging hidden topology with it: a closure or service-shaped handler that quietly carries ambient state, retry assumptions, transaction rules, host capabilities, or the specific context through which an outside capability is made available. It still presents itself as one ordinary function value. The abstraction looks cleaner while the hidden obligations become harder to see. What looks like a local substitution may no longer be a substitution of value at all, but a substitution of the logic being relied on.

That is why context objects and ambient carriers so often rot into junk drawers. They become the place where hidden prerequisites, state handles, cancellation signals, transaction hints, feature flags, caches, and timing assumptions are all allowed to accumulate, because the representation has no cleaner way to keep those concerns distinct while still making them available. What begins as a narrow carrier for one legitimate ambient condition turns into a shared bag. Anyone may extend it. Anyone may inspect it. Anyone may mutate it. What looks like convenience is often compressed topology looking for a hiding place.

## Recovery Work

Engineers respond to this compression with local repairs. Left alone, text drifts toward spaghetti. Not because programmers are careless, but because linear expression is the path of least resistance. To recover separations the medium did not preserve, teams introduce interfaces, wrappers, containers, reactive layers, state charts, and comments like "must happen after commit." The more one resists textual gravity, the more compensatory structure tends to accumulate. The same medium that makes entanglement easy makes separation expensive. The central logic may be small, yet the scaffolding around it can take over the page.

A great deal of what software engineering calls style, architecture, or design patterns is therefore not merely expression of the logic, but recovery work around it. We repeatedly train ourselves to speak a narrower dialect than the problem itself would naturally demand, because the medium cannot safely carry the fuller expression.

The symptoms show up immediately, even in the smallest habits of textual engineering. Names start carrying structure that the medium dropped. The old burden of "naming things" is not incidental, but one symptom of a medium that cannot preserve connection and proximity directly. Indirection becomes a prosthetic for missing separation.

The same recovery pattern appears in more elaborate techniques as well. Even metaprogramming often remains trapped inside the same condition, with one layer of text manipulating another rather than structure operating directly on structure. Effects suffer similarly. Without a native orthogonal channel, they become either ambient hazards or heavily wrapped abstractions. What often presents itself as language sophistication is, in part, a long culture of compensation for representational loss.

That does not mean asynchronous behavior, temporal ordering, state change, or side effects are somehow the enemy. Real systems must contain and describe them. The mistake is to hide them, downgrade them into embarrassing residue, or refuse to describe them except through indirect workarounds. A faithful medium should let them appear as first-class structure: explicit, bounded, and independently reasoned about, rather than smuggled through ordinary sequence or pushed into ambient context and wrapper lore.

## Reconstruction Burden

At scale, the problem stops looking local and starts looking architectural. The system behaves like a graph, not a tape: a graph of boundaries, commitments, supplied capabilities, and slices. The files, however, still present themselves as a tape. A directory tree can help store code, and an import path can help reach it, but neither one is a first-class declaration of structural role. So the reader has to reconstruct the graph from residue: naming, placement, adapters, diagrams, runbooks, traces, and painful prior incidents. Even observability arrives largely as after-the-fact reconstruction. Logs, traces, and debugging sessions are attempts to recover transitions and causal paths the representation did not preserve natively. This is why the so-called second body keeps returning. It is not an optional explanatory supplement added by tidy-minded teams. It is recovery work forced into existence by the limits of the official medium.

Machines inherit the same burden. A model editing source code from tokens must reconstruct the missing structure from textual residue. It has to infer which lines are direct calculation, which encode response structure, which are coordination scaffolding, and which really cut across host or transport boundaries. Better models may recover more of that hidden structure, but they are still recovering it. The brittleness is not only a limitation of current AI systems. It is also a symptom of a representation that leaves too much of the logic implicit and spends both human attention and machine context budgets on reconstruction before reasoning can even begin.

Consider one worked contrast. Picture a single event-driven `async` handler: an external request or message arrives, the handler reads fields from a context object, awaits a downstream call, triggers an effect (write, publish, charge), and reports progress through a callback supplied by the caller. In source text, those relations usually arrive as **one** advancing thread: nearby lines, nested scopes, and implicit capture. The reader must infer what is actually distinct.

The same textual thread is doing at least three jobs. **Who advances the boundary**: does outside arrival move the work forward, or does the handler proceed only when something is sampled or resumed? **What temporal form does the logic have**: ordered continuation, retained progression, or a present transform once inputs are fixed? **Where are needed capabilities, supplied handlers, and ordinary values declared, satisfied, or connected**: context fields, injected services, and callbacks are not interchangeable merely because they are "available." They mix ordinary value flow with hidden supply paths unless those paths are separated by hand.

This is the recognition the example is meant to force. The medium schedules first; it does not present these relations as separately nameable or abstractable structure. The reader can recover them, but only as a fragile working model held in mind after the line has already braided them together.

The point, then, is not that text is worthless, or that disciplined programmers could erase the issue by trying harder. The point is that the dominant medium is selectively expressive. It preserves sequence well. It preserves some other structural relations only unevenly, and often only by forcing them to hitchhike on the same syntactic gesture. It can schedule topology without representing topology, and that is exactly why the damage remains hidden for so long. As an information-theoretic metaphor, text-first programming behaves like a lossy, biased channel for logic. Some relations pass through with high fidelity; others are compressed, distorted, or dropped. When a richer logical topology is repeatedly squeezed through that narrow channel, the result is what I will call **dimensional collapse**: a compression tax imposed by the medium before any particular language, framework, or paradigm has even had the chance to help or hurt.

# 3. The Engineer Who Came From Hardware

A diagnosis this broad invites a fair suspicion: perhaps it only redescribes familiar pain. The claim here is narrower. The distinctions were not first discovered in theory and then projected back onto practice. They were forced while trying to build something.

The pressure began as a build problem: how to make logic visible, editable, queryable, reusable, and composable as an engineering object rather than leave it half-buried in source files and framework conventions. The hope was not merely to make logic easier to inspect, but to make it precise enough to behave more like a standard part: something assembled by declared connection rather than re-authored seam by seam. That starting point matters because it fixed the direction of pressure. The first question was not "which theory is elegant?" It was: what must become explicit if logic itself is to be handled, inspected, sliced, substituted, and reshaped directly?

The intuition came largely from hardware. I had come to software from there, and one question stayed with me: if digital logic could be described in terms of combinational and sequential circuits, what were their software counterparts? The first answer seemed plain enough: stateless transformation on one side, state-bearing progression and resumption on the other. But software did not stay inside that pair for long.

I also felt an early friction in the habit of treating the call as the default gesture. A call does not merely move a value. It also commits the logic to a control story: who initiates, who waits, who must already be present, and where execution may resume. What should often remain separately legible as value movement and control commitment gets braided into one local gesture. Procedural narration is powerful for local construction, but it is a strained way to describe a world that often arrives through events, external completion, parallel activity, and boundary response. Who drives the boundary, and how needed outside capability is made available, mattered just as much.

Hardware had made other relations feel ordinary that software kept expressing awkwardly. Parallel activity, push-shaped response, decoupled boundaries, and replaceable modules at prepared connectors were native there from the start. Signals propagate in parallel. Responses are pushed. Units meet at declared boundaries. A chip or board can often be replaced at a prepared connector without redrawing the rest of the system.

Related engineering traditions sharpened the same expectation. Distributed explicit state makes state placement legible. State machines make legal transitions explicit. Datapath/control-path separation keeps value movement distinct from the logic that selects, gates, stalls, or advances it. Signal-processing networks treat propagation as a graph rather than a call stack. Across all of them runs a stricter discipline of change: state should have a legible home, modification should have a clear source, and nothing should change merely because a description exists nearby. It should change only when some explicit step, arrival, or execution boundary occurs. In software, those same relations were real enough, but strangely hard to state directly.

Pins, nets, signal boundaries, latches, circuits: not as a governing ontology for software, but as a discipline of explicit structure. In that discipline, composition is not reconstructed after the fact from a narrative stream. It is visible in the artifact.

A bounded board-level image stayed especially useful: a compatible module may be fitted through a prepared connector, bring its own internal structure, and still communicate through declared pins. The board hosts the module, but does not semantically swallow it. The relation is mounting and attachment, not parenthood or containment. That image later informed a stronger notion of composable software components as well: composition by declared connection rather than by a parent enclosing a child inside its own tree. What mattered there was not hardware as proof, but a culture of standard parts: units precise enough that larger systems could be composed by connection rather than rebuilt at every seam. I invoke that only as intuition for prepared connectors and explicit boundaries, not as proof and not as a claim that software is secretly board layout.

What hardware contributed was a higher standard of representational honesty. The goal was not to keep logic as close as possible to the eventual instruction stream; machines would consume lowered artifacts anyway. It was to make the authored object behave more like a schematic: something a human could inspect as structure before execution flattened it into schedule. A schematic can remain hierarchical. It stays organized by logical relation rather than physical placement, and it can be traversed at different levels of detail without ceasing to be the same artifact. Even software traditions that move closer to graph-shaped composition, including functional pipelines and reactive networks, often stop at the level of a hand-authored textual netlist. The connections are described, but not yet presented as a first-class schematic.

Once that standard was pushed into implementation, ambiguities that ordinary code often tolerates stopped being tolerable. A connection could not remain vaguely "some kind of call." The system had to decide whether the boundary was push-shaped or pull-shaped, and whether moving a value also meant handing over control. A unit could not remain vaguely "some kind of logic." It had to be clear whether it merely transformed a present input, preserved state across time, or resumed under an outside event. Pluggability could not remain a slogan. The system had to answer what, exactly, counted as the same behavior when the supplied logic changed. Even identity became sharper. If logic was to be edited and tracked as structure, it was not enough to know that some nearby variable or function name seemed related. The system needed to know which local place depended on outside capability, which boundary was being crossed, and what kind of thing was moving through it.

These were not aesthetic refinements. They were implementation pressure. Without those distinctions, execution, editing, verification, and replacement semantics all became unstable. A runtime can often survive hidden structure so long as it has a schedule. An editor, verifier, slicer, or substitution mechanism cannot. The moment logic becomes something to manipulate rather than merely run, the hidden distinctions stop feeling optional.

That sequence is the real point. The vocabulary came later; the distinctions were forced first. The field has not lacked symptoms, repairs, or local theories. What it has largely lacked is a medium-level diagnosis that treats them as one recurring representational loss. Under implementation pressure, what had looked like many separate difficulties began to read as repeated payment of the same tax. None of this amounts to proof. It does, however, justify taking the model developed next as more than wordplay: an attempt to name pressures that implementation kept making impossible to ignore.

# 4. A Coordinate System for Logic

Once those distinctions have been forced into view, the next task is to describe them directly rather than leave them as a loose collection of engineering discomforts. The model proposed here is not a decorative vocabulary layer placed on top of familiar code. It is a coordinate system for ambiguities that ordinary code keeps asking the reader to untangle by hand.

## Reader's Map

This chapter carries enough load that it is best read as one sequence. It first clarifies the claimed space of the tri-axial model, then develops **X** and **Y** as the horizontal **Execution Plane**, then introduces **Z** as the vertical question that plane still leaves unresolved, and finally recombines the pieces through recurrence and symmetry, with a hardware analogy used only as an intuition at the end.

Everything in the chapter elaborates three questions, no more:

- **X** asks how this boundary is driven: by external arrival (**push**), or only under sampling and gated progression (**pull**).
- **Y** asks how the **current layer** exists across time: as retained trajectory and progression (**time-like**), or as a present mapping without that retained identity (**space-like**).
- **Z** asks where a **requirement** is declared, and **from which supplying relation** compatible logic fulfills it: locally bound or resolved upward through an explicit lineage.

**Z** is likely the least familiar axis not because its phenomena are rare, but because ordinary software usually hides requirement fulfillment inside naming, parameterization, containment, callbacks, closures, and ambient context. The later discussion of **Z** uses a familiar `map`-style example to make that separation concrete.

## The Claimed Space

Why use coordinates at all? Because the pressure at issue here was collapse, not random complexity. A call, a handler, or a small block of code was being forced to answer several structural questions at once. A coordinate system helps here for the same reason it helps in any crowded space: not to romanticize the object, but to keep one direction from being mistaken for another. Once those oppositions are stated directly, separation no longer has to be reconstructed after the distinctions have already been collapsed together in text.

The axes are not the whole data of the topology. They are the coordinate skeleton through which that data is read: concrete boundaries, requirement sites, requirement surfaces, connections, local attachments, and fulfillment relations still belong to the topology itself.

The working axiom is this: **A Logic Unit (LU) is a bounded, fractal topology coordinated by three orthogonal axes: interaction polarity (X), manifestation mode (Y), and requirement fulfillment (Z).**

This should not be read as saying that a LU is an irreducible atom. At any chosen scale, it is the smallest bounded region of logic that can be described coherently in terms of interaction, manifestation, and requirement fulfillment.

The claimed space needs four clarifications up front.

- It concerns logic in the computable domain rather than any single implementation medium: logic may be realized as single-machine software, distributed software, or digital hardware, including FPGA and ASIC realizations, even though each projection brings its own engineering constraints.
- It belongs to the logic level, where a logic unit is described, reasoned about, and verified as logic before any particular host realization is considered.
- It is logical rather than Euclidean: the axes do not measure quantities, but separate kinds of question concerning boundary driving, current-layer existence, and requirement fulfillment.
- Its orthogonality is semantic rather than mechanical: answering one of these questions does not answer the others, and a realization need not preserve them as three physical subsystems so long as the distinctions remain expressible at the boundary.

The model earns its keep at the poles and their crossings. Cases that appear mixed are usually better understood as compositions or decompositions across boundaries, scales, or site-fulfillment relations than as blurred values on an axis.

## The Horizontal: The Execution Plane Spanned by **X** and **Y**

### **X**: Interaction Polarity

The first axis, **X**, is interaction polarity. It asks how this unit is advanced at its boundary. In **Push** mode, written here as **+X**, an arriving external signal may advance the unit directly: arrival, subscription, notification, or delivery into the boundary is enough to move it. In **Pull** mode, written as **-X**, the unit advances only under sampling, reading, requesting, latching, or other gated progression. This is a statement about interaction across the boundary: what advances the unit here, and on whose initiative. It is not a statement about whether the unit keeps state, and it is not a statement about where its implementation comes from.

### **Y**: Manifestation Mode

The second axis, **Y**, is manifestation mode. It asks how the current layer's logic exists across time. In **Time**, written here as **+Y**, the layer has a temporal trajectory that must be preserved: it remembers, carries forward prior results, or advances through retained progression. In **Space**, written as **-Y**, it is exhausted by the present mapping from input to output; it transforms, but does not retain its own temporal identity between moments. It is not about interaction polarity or implementation origin. It is a statement about whether the current layer is temporally extended or merely present. The crucial point is that **+Y** does not require every participating node to hide memory internally. A current layer may be temporally extended because ordered progression and retained results span transitions, or because the bounded logic object itself persists across successive events. A local mapping step, by contrast, remains **-Y**.

### Four Logic Unit Kinds on the Execution Plane

The **Execution Plane** is the two-dimensional semantic plane spanned by **X** and **Y** alone. It brackets fulfillment for the moment and asks only two questions of the current layer: how is it advanced, and how does it exist across time? In that restricted but crucial sense, it is the semantic surface on which a LU's kind is laid out and first read.

Once **X** and **Y** are separated, the **Execution Plane** becomes easier to read. Crossing those two axes yields four kinds of Logic Unit. These are the behavioral kinds visible before fulfillment is considered, and they classify bounded logic bodies at the current scale.

- **Combinational (-X, -Y):** stateless, a present mapping exposed for sampling; suited to local derivation, calculation, normalization, and other read-shaped transforms
- **Sequential (-X, +Y):** temporally progressive, advancing one step at a time through an ordered succession, admitting only pull-shaped inputs, and preserving results across transitions; suited to ordered pipelines, staged procedures, and other stepwise flows whose progression itself must be retained
- **Stateful (+X, +Y):** internally persistent, a resident reactive state machine whose own state persists and evolves under external events; suited to long-lived controllers, sessions, stores, and other resident reactive loci that must absorb and respond to ongoing arrival
- **Structural (+X, -Y):** stateless at its own layer yet directly responsive to external arrival, re-manifesting current structure without carrying forward its own temporal trajectory; suited to reactive rendering surfaces, mounted component structure, and other cases where current form must be re-issued under changing arrival

**Structural** is the least familiar crossing because direct responsiveness is easy to mistake for statefulness. The intended intuition is that external arrival may cause a current structure of relations to be re-issued, as in a view tree or virtual-DOM-like graph, while the temporal identity being reflected may live in stores, controllers, signals, or parent state rather than in that structure itself.

These are not merely four descriptive categories. They are four LU kinds. The claim is narrow. Not every software artifact, as encountered in ordinary practice, arrives already purified into one of four names. The point is simpler: once a bounded LU is made explicit at a chosen scale, the primary kind it exhibits on the **Execution Plane** is one of these four.

Choosing among them is therefore not a matter of stylistic preference. On the **Execution Plane**, the kind of LU fixes the unit's behavioral envelope: what class of behavior it may legitimately exhibit and what boundary discipline it may lawfully expose. Both axes matter here. At the boundary, **X** shapes interaction form: pull-shaped kinds remain pull-shaped, while push-shaped kinds admit direct external arrival as part of their boundary discipline. Within the plane, **Y** separates kinds that might otherwise be confused. **Sequential** and **Stateful** are both **+Y**, yet one preserves ordered progression while the other preserves a resident interior across events; **Combinational** and **Structural** are both **-Y**, yet one is exposed for sampling while the other is re-manifested under external arrival.

These are not interchangeable kinds, and their differences cannot later be erased by choosing a different implementation origin or realization path. One must first determine what kind of LU is being described at the chosen scale. The point here still concerns LUs themselves: bounded logic bodies at the **Execution Plane**.

### Composing Logic with LUs

Once a LU has been read on the **Execution Plane**, a further structural fact comes into view. A LU is not only a kind. It is a bounded topology that can be described and packaged as one local logical body. That is what the name **Logic Unit** is meant to mark: not an indivisible atom, but a unit of logic at a chosen boundary and scale. In practice, defining a LU means defining its boundary and interface, manifesting smaller logic bodies within it, and declaring the relations and connections among them.

At this stage one structural duality is worth naming. The same bounded logic body may be read in itself as a LU, yet may also appear inside a wider LU as one local instance at the current scale. A later representation can record that appearance as a **Logic Unit Instance (LUI)**.

Larger logic may therefore be composed by recursive LU/LUI nesting across scale. From within, a LU is the bounded local world whose boundary, internal structure, local appearances, and declared connections are being described. From without, that same LU may appear as one bounded unit within a wider topology. This already gives the model its fractal scaffold.

It also buys substantial horizontal decoupling. Much of what an ordinary call keeps mixed together can now be separated into first-class distinctions on the plane itself: push-shaped arrival, pull-shaped access, present mapping, ordered sequencing, resident state, and direct structural composition among LU kinds. In that sense, asynchronous interaction, event delivery, pull-based reading, stepwise progression, state management, and structural recomposition no longer need to hide inside wrapper APIs or scheduling convention. Relations that ordinary code often expresses as glue can instead be stated as declared connection and composition.

But this remains only horizontal decoupling. If every local instance had to be fixed by its containing structure, recursive nesting would still yield composition and containment, not full decoupling. Any dependency declared there would have to be satisfied by direct inclusion or local composition, so requirement and fulfillment would collapse back into the same structural act. Nor would it help to treat the needed logic as ordinary payload and pass it as in-plane input or delivery along **X**; that would only hide fulfillment inside flow. The coupling would simply reappear: the local logic could not declare what it requires without also being bound either to the logic that satisfies that requirement or to the delivery path by which it arrives. That remaining limitation is what the next axis addresses.

## The Vertical: Requirement Fulfillment along **Z**

The vertical axis addresses exactly the coupling that horizontal composition still leaves behind. **Z** becomes necessary when a LU can declare a requirement at one place while the compatible logic that satisfies it is supplied through another relation. Without that separation, every dependency would have to enter by direct inclusion, local composition, or ordinary payload flow, and requirement would collapse back into the structure or delivery path that happens to fulfill it.

A **site** is the local logical place within the current LU where such a requirement is declared. It fixes a requirement surface before it fixes fulfillment. That surface says what kind of logic may lawfully fulfill the requirement, what boundary discipline that logic must satisfy, and what further requirements must remain visible if the fulfilling logic carries unresolved requirements of its own. Here, the theoretical role is simpler: a site is a declared local place where a requirement can be satisfied by compatible logic; fulfillment is the binding of that compatible logic to the site.

This is why **X** and **Y** are not enough. They still determine the required behavior on the **Execution Plane**: how the site is driven, and what kind of temporal or structural behavior is permitted there. **Z** asks the remaining question: from which supplying relation does the required logic arrive?

### Dependency as Declared Requirement

In software terms, such a site appears as a dependency requirement. The word should stay close to its ordinary software sense: not every incoming value parameter, but a required capability, behavior, or logic supplier that must be supplied to the local structure. Ordinary value inputs do come from outside, but they belong more naturally to boundary input and in-plane flow.

Dependency, in the present sense, is therefore not the enemy any more than asynchrony, state, or side effect is the enemy. The problem is not that logic depends, but that dependency is too often hidden, blurred, or collapsed into some other channel instead of being given explicit first-class expression. A dependency is not first a concrete implementation waiting to be passed in. It is first a declared requirement inside a LU: the requirement surface is fixed, yet the fulfilling logic is not.

This is also why **Z** is easy to miss. Textual software has a strong bias toward names. If a symbol resolves, a callback is passed, a context value is found, or a supplying object happens to be in scope, ordinary code often treats the dependency as solved. But the important structure has been flattened: where the requirement was declared, which scope supplied the satisfying logic, what reachability path made it available, and why this candidate rather than another was valid. The vertical relation exists, but it is encoded indirectly through naming, parameterization, containment, capture, lookup, or convention.

Once declared, the requirement has two readings that ordinary code often mixes together. From within the LU, the requirement must be usable as part of the local topology rather than hidden behind a naming convention or threaded context. From without, when that LU appears inside a parent as a LUI, the unresolved requirement becomes part of the requirement surface exposed by that LUI.

The internal reading has two common use-forms.

First, it may appear directly in the local topology where a LUI would otherwise stand: not as concrete fulfillment and not as an untyped gap, but as the declared requirement made available as a first-class local appearance.

Second, the requirement may be routed to a requirement exposed by an inner LUI. Then, when the outer requirement is fulfilled, the supplied compatible logic can also fulfill that inner site. From the viewpoint of the receiving LUI, fulfillment still arrives through a vertical supplying relation rather than through ordinary payload flow.

In both uses, the requirement remains a declared requirement; what changes is how fulfillment will be connected through **Z**.

### Require and Fulfill as Directional Readings

Once requirement and fulfillment are separated, the vertical relation can be read from two sides. From the site side, the path is read as **Require (-Z)**: the site requires fulfillment. From the supplying side, the same path is read as **Fulfill (+Z)**: compatible logic fulfills that requirement. The two names do not describe different mechanisms. They name the same fulfillment path seen from opposite ends.

That is why **Requirement/Fulfillment** deserves its own coordinate rather than being folded back into ordinary in-plane flow. A logic body is not permanently stamped as "requiring" or "fulfilling" in all circumstances. The same scope may require fulfillment at one site and fulfill another requirement elsewhere. What changes is not the essence of the artifact, but the direction from which the fulfillment relation is being read.

This is also why **Z** is not merely dependency management renamed. Frameworks, lookup rules, explicit bindings, registries, plugin mechanisms, and similar devices are later fulfillment choices. The theoretical point is simpler and more general: whenever a requirement is declared without its fulfillment being fixed locally, the supplying relation must remain explicit.

A requirement exposed at a LUI can be fulfilled in two broad ways. It may be fulfilled at the current manifestation by logic bound there, or it may be resolved from a wider ancestor supplying scope along the vertical path. The first route is **Z-0**: local bound fulfillment. The second route is **Z-n** for **n > 0**: upstream resolution through the wider supply lineage. Both are answers to the same question: how is this LUI's declared requirement fulfilled?

Functional programming offers useful shadows of this separation. Higher-order functions, anonymous functions, passing functions as values, lexical closure, and scope-based resolution already show that logic can be supplied to a site rather than merely executed in place. Higher-order programming is not the mistake; it is one of the clearest signs that ordinary programming already needed logic to be supplied as logic. The problem is that ordinary functional syntax usually expresses that supply through the same value-passing surface as ordinary data: a mapper, predicate, continuation, or handler appears as another argument or captured value.

The departure here is not the thought that logic can be supplied, but the refusal to let logic fulfillment travel through the data channel. The following two subsections use the familiar shape of `map` to keep that distinction visible: ordinary data and signals remain in-plane, while compatible logic that fulfills a declared requirement is read along **Z**.

### **Z-0**: Local Bound Fulfillment by Closure

A **Closure** is a supplying wrapper bound to a LUI as the local fulfillment of one exposed requirement. It is the form in which an inner logic body is made available at that site.

That inner body is written in the same structural language as ordinary LU-internal logic, not in a special secondary form. The wrapped body is read through the required kind, but that kind is not chosen by the wrapper in isolation. It is fixed by the requirement and boundary semantics exposed by the owning LUI, and the inner body must present itself through those semantics. Interactions required by that fulfillment relation remain part of the LUI-Closure boundary rather than ordinary connection points in the parent LU.

The wrapper then does two things at the boundary. First, it exposes selected ordinary boundary contacts of the inner body outward so that body can communicate with the parent LU topology. These exposed contacts are not the fulfillment relation itself; they are ordinary in-plane contacts paired with the body's own boundary declarations and made visible outward rather than hidden inside capture. Second, the wrapper admits a vertical supply environment into which the inner body's own requirements may resolve.

Which contacts are exposed, and which supply environment is admitted, belong to the Closure boundary rather than to accidental capture.

This is close in spirit to functional closure, but with a sharper separation of relations. A functional closure captures an environment around executable logic; here the captured or admitted logical supply is not treated as ordinary payload. Data still moves in-plane through declared and exposed boundary contacts, while logic fulfillment is carried explicitly along **Z**. The result is a double decoupling: required logic is not smuggled through data flow, and data communication is not hidden inside capture.

In the **Z-0** reading of the `map` example, the mapper requirement is fulfilled at the current manifestation by binding a mapper body as a local Closure. In ordinary functional syntax, this may look like passing an anonymous function to `map`; here, that anonymous function supplies the inner body wrapped by the local Closure.

The example separates three relations that the surface syntax keeps close together. The sequence elements are ordinary in-plane data. The mapper body's parameter and return value are ordinary boundary contacts of the supplied body: they let data enter and leave, but they are not the fulfillment relation itself. If the mapper body reads values or calls functions from its surrounding scope, those are not mapper input elements either. They belong to the vertical supply environment admitted by the Closure. Ordinary syntax presents all of this as arguments, returns, and capture; the point here is to give each relation its own place.

The same `map`-style case also shows why callback-shaped progress reporting is easy to misread. The mapped array is the ordinary result of the computation. Progress, however, is not that result; it is a push-shaped signal emitted while the mapping proceeds. Ordinary code often supplies a progress handler and calls it with the current index or percentage. In this model, supplying such a handler is a **Z** relation, while each progress report is an **X** relation.

If no return value is relevant, the cleaner reading is to expose progress as an ordinary push-shaped boundary contact through the Closure and let the parent LU topology connect that signal to whatever observer or handler is appropriate. Once treated as an in-plane signal rather than a callback dependency, progress can be routed, combined, filtered, throttled, or observed by ordinary topology instead of being hardwired into the supplied mapper logic.

With that example in view, the distinction can be stated cleanly. A **LU** is the bounded logic body with its own kind, boundary, internal structure, and declared requirements. A **LUI** is that logic body's local manifestation inside a wider topology, carrying the LU's requirement surface into that manifestation. A **Closure** belongs to the manifestation level: it is attached to a LUI as the local fulfillment of one exposed requirement, not as the LUI itself and not as a general projection or realization mechanism.

Because a Closure also contains logic, it may be tempting to treat it as another LU definition. The boundary discipline is different. A LU declares its own kind, boundary, and requirement surface; a Closure's inner body is fitted to the kind and boundary semantics required by the owning LUI. For that reason, the wrapper does not invent new sites merely by existing. Uses of required logic inside the wrapped body resolve against the supply environment admitted at that boundary and the requirements already exposed by the manifestation relation.

### **Z-n**: Upstream Resolution by Supply Lineage

In the same example, the mapper requirement need not be fulfilled by a mapper body bound directly at the current manifestation. If compatible mapper logic is made available by an enclosing supply scope, the same required site resolves upward instead. The elements being mapped still travel through in-plane contacts; only the required mapper logic resolves along **Z**. That is the upstream case.

The upstream route is therefore not a flat dependency table. It is the recursive form of the same separation seen in the `map` case: a LUI exposes a requirement; a Closure may fulfill it and open an inner body; that body may manifest further LUIs; those LUIs may expose further requirements; and the pattern repeats. The recurrence is not LU directly containing Closure directly containing LU in a loose sense. It is the stricter alternation of manifestation and fulfillment: **LUI -> Closure -> inner body -> LUI -> Closure -> inner body**.

That alternating chain forms the supply lineage. Each Closure admits a vertical supply environment into its inner body, and each intervening LUI may grant, mask, or remap what continues inward. The receiving LUI is therefore not asking its immediate container to contain the needed logic. It is resolving through a lineage of supplying scopes. Reachability belongs to that vertical structure, while validity and equivalence remain semantic and domain questions.

One useful derived notation follows without adding a fourth axis. Let **Z-n**, for **n >= 0**, denote the vertical resolution depth of a declared requirement from the viewpoint of the LUI that exposes it. **Z-0** means local fulfillment at that LUI. **Z-n** for **n > 0** means fulfillment is found only after resolving upward through **n** vertical steps along the accumulated supply lineage. The notation separates reachability depth from fulfillment choice: it tells the reader how far the requirement had to resolve, not which reachable supplier is valid.

### Why the Vertical Had Been Hidden

This is where a hidden weakness of ordinary dependency and higher-order style becomes easier to name. The problem is not naming as such, but letting naming become the primary carrier of dependency fulfillment. Once fulfillment collapses into lookup by symbol, many structurally important facts become obscure: where the requirement is declared, from which vertical scope the satisfying logic arrived, why one candidate was chosen over another, and whether a change in containment, registration order, or local shadowing silently changed the result. The structure still exists, but it is no longer first-class.

Textual engineering keeps rediscovering fragments of this pattern through small functions, function values, `context`, service objects, callbacks, ambient scope nesting, and implicit supply. Those moves are often good engineering, but in text they remain indirect and fragile. Requirement, fulfillment, reachability path, and compatibility choice have to be reconstructed from names, threading convention, and hidden capture. The result is an approximation of the missing topology rather than a direct representation of it.

This is why the axis is both simple and strong. It does not add a large mechanism. It adds one missing distinction: declaring a requirement is not the same act as fulfilling it. Once that distinction becomes first-class, dependencies can remain explicit without being forced into payload flow, local composition, naming convention, or accidental containment order. **Z** is the compact coordinate that lets logic depend without letting dependency become invisible.

## Fractality and Symmetry

Two derived properties make the model usable rather than merely notational. They do not add new mechanisms; they name what follows once manifestation and requirement fulfillment are both first-class. The first is **fractality**, produced by two coupled recurrences.

The first recurrence is structural. From within, a bounded logic body is treated as a LU: a local world with its own **Execution Plane**, sites, and internal structure. From without, once that same body appears inside a wider topology, it is read there as a local appearance that a later representation can record as a **LUI**. The names differ because the viewpoint differs, not because the underlying logic body has changed.

The second recurrence is vertical. A declared requirement may change role as the viewpoint crosses a boundary: inside a LU it may appear as domain-facing use or as supply routed to another internal site; from outside, once that LU is manifested as a LUI, the same requirement becomes something to be fulfilled. Fulfillment then opens or uses a supply lineage in which descendant sites may repeat the same pattern. One may therefore speak of a double fractality: one of manifestation across scale, and one of requirement and fulfillment across levels.

Those two recurrences also produce two corresponding symmetries. The first is a symmetry of scale and role: the same structural grammar can be read as a **LU** from within, as a **LUI** from without, as a local placeholder for a declared requirement when that requirement participates in domain logic, or as a Closure-wrapped body when that requirement is fulfilled. These are not separate ontologies. They are different readings of logic, manifestation, requirement, and fulfillment across boundary and scale.

The second, separate symmetry is directional along **Z** itself: the same path is requirement from one side and fulfillment from the other. Fractality and symmetry are therefore not decorative additions. They are what keep the model stable as the reader zooms in, zooms out, or crosses a boundary. Without them the axes would collapse back into a pile of local special cases.

## A Hardware Intuition

After the formal account, a hardware analogy can make the picture easier to hold in mind, but only if its status is kept clear. The analogy is an intuition, not a reduction. A netlist is first a static structural description, not yet the waveforms that later run through it. Much of software, at the level that matters here, is similar: boundaries, declared interactions, requirement sites, requirement surfaces, Closure bindings, and fulfillment paths are logical structure before they are execution. Hardware helps because it forces that structure into view.

Imagine a LU as a board-like logic design. A LUI is that design assembled into a parent topology as a PCBA-like region; its manifestation position is closer to a slot or footprint than to the board itself. The inner body wrapped by a Closure can be pictured as a similar independent circuit region once it is fitted as fulfillment. The larger structure is therefore closer to a PCBA stack than to a single flat board: each placed region has a packaged boundary, exposed pins for ordinary interaction, local circuitry whose behavior belongs to the current **X/Y** plane, and prepared requirement connectors for compatible logic to fulfill.

In this picture, **X** is boundary drive: Push resembles an event, line, or interrupt, while Pull resembles a sampled, requested, or latched relation. **Y** is the temporal character of the local circuitry: Space-like regions resemble present combinational structure, while Time-like regions carry trajectory, memory, sequencing, or eventful continuation.

The important distinction is that ordinary pins and traces carry in-plane data or signal interaction, while requirement connectors are logical fulfillment interfaces. **Z** is the fulfillment dimension for those connectors, not another wire in the same plane.

- In **Z-0**, a Closure's inner body is like an independent circuit region fitted through the local requirement connector. Once fitted, it may still expose ordinary boundary contacts for in-plane data and signal connection with its surroundings.
- In **Z-n**, a descendant requirement connector may receive compatible capability through something only loosely comparable to an inter-board harness: not ordinary data wiring, but an enabling relation arriving from an upstream point in the stack, while intervening boundaries still control what remains reachable.

The analogy is neither exact nor complete, but it captures why vertical fulfillment paths should not be collapsed into ordinary payload flow, signal wiring, or bare containment. It also keeps the emphasis on static logical topology: which regions exist, which boundaries they expose, which requirement surfaces are fixed, which sites await fulfillment, and along which paths fulfillment may arrive. Textual software can encode all of that, but it usually scatters the facts across names, scopes, callbacks, registries, and conventions. The hardware picture restores the missing geometry.

The limit is equally important. Ordinary physical hardware is weaker at higher-order composition. A board may accept a module, but it does not usually treat another logic body as first-class fulfillment whose own requirements can be recursively fulfilled in the same way software can. That move is natural in the `map` example above: the LU may receive mapper logic against a declared requirement, while that body may carry requirements of its own. The analogy is therefore strongest for topology, boundaries, connectors, requirement surfaces, and supply paths. It becomes weaker if it is used to cap the recursive expressive power of logic itself. That limit does not weaken the model; it locates the analogy.

The model is not owned by hardware or software, and concrete projection into source code, runtime services, physical circuits, or another engineering medium belongs to projection and realization rather than to the logical definition.

The chapter's real claim is broader than the analogy. The model is useful not because it makes software sound geometric, but because it lets several structural questions stop masquerading as one. Within a given scope: how is this boundary driven, what temporal form does this layer take, and what fulfills this site? Across scopes: when the same logic is viewed from inside, outside, or along a fulfillment lineage, which role is being read? Once those questions are no longer fused, the fractal structure becomes stable, and familiar software traditions should start to look less like rival creeds and more like partial views of the same space.

# 5. Paradigms as Partial Projections

A balanced literature review is unnecessary here. The narrower test is explanatory power. If the tri-axial model is doing real work, it should make familiar programming reforms and paradigm fragmentation look less accidental. It should explain why different traditions each feel clarifying, why none of them absorbs the whole field, and why the same families of repair keep returning under different names.

Read in that spirit, paradigms stop looking primarily like rival kingdoms. They look more like preferred projections of a richer logic geometry. Each tradition preserves some part of the space unusually well, then has to recover the rest through secondary machinery. That recovery work is not a failure of intelligence. It is the predictable cost of trying to preserve a multi-axial topology through a medium and a tradition that privilege only part of it.

## Projection and Leakage

The easiest cases sit on the **Execution Plane**. In simplified form:

- **Functional programming** tends to privilege present mapping, local derivation, and demand-shaped reasoning, close to the pull/space corner **(-X, -Y)**.
- **Procedural practice** keeps ordered transition, stepwise effect, and temporal narration visible, close to pull/time **(-X, +Y)**.
- **Reactive systems** foreground external arrival, propagation, and event structure, especially push/time **(+X, +Y)**.
- **Reactive view and component systems** often expose push/space structure **(+X, -Y)**, where current form is re-issued under arrival without the view itself carrying the primary temporal identity.
- **Object-oriented and component-centered practice** ranges from durable object identity and interface substitution to larger compositional surfaces. It is less a clean execution-plane projection than a mixed attempt to make durable units, bounded interfaces, substitution, and composition manageable at once, often blending execution-plane identity with questions of fulfillment and replacement.

This is not an exhaustive survey and should not be read as a rigid taxonomy. The examples are representative projections: real systems mix styles, and each tradition contains internal diversity. The point is softer but more useful: each tradition tends to make one region, or one repair strategy, feel natural.

That success explains both the value and the danger of paradigms. When one projection preserves a region of the geometry with high fidelity, it can start to feel like logic's natural form:

- Pure transformation starts to feel like the safest way to reason about programs.
- Step-by-step procedure starts to feel like the most realistic way to describe work.
- Event propagation starts to feel like the natural form of live systems.
- Re-issued structure starts to feel like the natural form of composition.
- Durable objects and bounded modules start to feel like the natural units of software structure.

The projection hardens into ontology. What it preserves becomes philosophy; what it cannot preserve returns as exception, effect system, lifecycle rule, framework convention, or architectural folklore.

This is why paradigms leak into one another:

- Functional systems cannot keep time, effect, and outside capability offstage forever, so they grow effects, handlers, resource scopes, and runtime scaffolding.
- Procedural systems start from ordered steps, but real work branches, waits, cancels, and resumes; callbacks, hooks, cancellation rules, and lifetimes are the repair.
- Reactive systems make propagation visible, then have to recover discipline for buffering, backpressure, scheduling, and retained state.
- Reactive view and component systems re-issue structure under arrival, then need identity rules, mount lifecycles, memoization, and external state to keep that structure stable.
- Object-oriented and component-centered systems make durable boundaries central, then rediscover that boundary does not guarantee behavioral equivalence, safe substitution, or visible fulfillment.

What looks like sophistication is often a tradition re-importing a structural question its primary projection could not keep visible.

## The Missing Vertical

The hardest returning question is **Z**. **X** and **Y** more readily became paradigms because they can masquerade as coding styles: transform, step, react, persist, compose. **Z** is less stylistic. It asks where a needed capability is declared, through which relation compatible logic becomes available, and under what requirement semantics one compatible supplier counts as valid fulfillment. That question rarely became a clean paradigm of its own. It survived instead as scattered engineering culture: dependency injection, providers, service locators, plugin surfaces, mock seams, ambient context, substitution rules, and framework-specific lifecycle lore.

That scattered survival is important. It means the vertical question was real enough to keep returning, but not stable enough to become ordinary structure in the medium. Dependency injection is the clearest example, not because it is the answer, but because it exposes the pressure. It separates use from supplying logic, but usually does so through names, containers, constructors, scopes, annotations, or framework rules. The relation becomes more manageable, yet it still has to be reconstructed from surrounding convention. The same pattern appears in context objects, service registries, function values and callbacks carrying captured environment, and plugin systems. They recover pieces of **Z**, but rarely make requirement, fulfillment path, reachability, supplier choice, and equivalence into one first-class topology.

This also changes how older paradigm debates should be read. The problem was not simply that different camps preferred different styles of reasoning and construction. The deeper problem was that each camp was often trying to use a partial projection to cover questions that belonged to the whole space. Effects are not an embarrassment to functional reasoning; they are a sign that temporal and boundary structure did not vanish. Explicit state and transition formalisms make the same pressure visible from another direction. Provider layers are not merely framework ceremony; they are a sign that needed capability and fulfilling logic need a visible relation. Lifecycle rules are not incidental bookkeeping; they often mark where manifestation, interaction, and fulfillment have been collapsed into one implementation story.

The same point can be seen without naming any particular framework. Modern engineering keeps inventing component trees, boundary slots, provider scopes, plugin surfaces, mock seams, lifecycle phases, and configuration layers. These are not all the same mechanism, but they share a family resemblance: topology is trying to reappear as engineering practice. The problem is that each repair is local. One tool makes composition visible, another makes supplying visible, another makes lifecycle visible, and another makes substitution testable. The underlying geometry keeps returning, but still as convention rather than as the represented object.

The same incompleteness appears even in traditions that recover graph shape more directly. Pipeline, signal-flow, dataflow, process-network, and functional-reactive traditions are especially suggestive near-misses. But when the graph remains subordinated to host text, operator chains, framework-specific scheduling, or implicit capture, the recovery is still partial. The netlist has been intuited, but not yet made first-class as the represented object. The topology is present, yet still depends on another medium to tell the official story.

## Toward Represented Topology

A quieter historical lineage shows what the next move would have to look like. Hardware design has long treated structure as something to be built, checked, transformed, and realized, not merely as a diagram drawn after execution. That does not solve the software problem by analogy alone, and it does not mean software should imitate hardware. It only clarifies the category of move required: once topology matters enough, representation cannot remain a commentary layer around an instruction stream.

From this perspective, historical fragmentation looks less like a tournament waiting for a winner and more like the predictable result of a missing representational layer. The paradigms were not worthless detours. They were partial recoveries. Each clarified some region of the space while the rest kept returning through adapters, handlers, providers, effects, lifecycle discipline, and boundary semantics. When many careful traditions keep recovering different parts of the same hidden structure, the next move is not to pick the least leaky projection. It is to raise the representation to the dimensionality of the thing being represented. If the tri-axial rereading is right, the missing piece is not one more paradigm and not one more round of paradigm combat. It is a substrate in which the geometry itself can be stated directly.

# 6. LogicIR as a Representational Consequence

If paradigm fragmentation really reflects a missing geometry, then the tri-axial model cannot remain an interpretive gloss on top of ordinary code. A geometry that only redescribes software after the fact would still leave logic officially represented by the textual projection that produced the original compression. If logic itself is the primary object, it needs a representation matched to its own structure: structured data rather than commentary around text.

## From Model to Representation

Once the coordinate system has done its work, the move to substrate is unavoidable. Coordinates can separate questions that text keeps collapsing together, but they are not yet the representation of logic itself. The next step is not another syntax, and not a celebration of diagrams over code. It is a substrate in which topology, boundary semantics, and fulfillment relations become explicit in the represented object rather than surviving only as an interpretive overlay.

### What LogicIR Is

That is the role of **LogicIR**, the **Logic Intermediate Representation** proposed here. LogicIR is a logic-as-data topological fabric: a structured data representation layer in which bounded units, boundary semantics, execution-plane relations, declared requirements, and fulfillment relations can be stated directly. It is not itself a runtime, an engine, or an act of execution. It is the shared object that editing, transformation, verification, projection, and execution can consume.

The nearest analogy is a netlist, but the target is computable logic more broadly, not hardware circuitry alone. The point is not to imitate hardware. It is to stop treating topology as commentary around code and start treating it as part of the thing being described. LogicIR is therefore less a product category than a representational category: if the topology is logically real, something in this category has to exist.

### What Must Be Representable

What follows from the model is not one final wire format, but a representational obligation. At this level it would be a mistake to freeze one prototype schema and call it the theory. The core obligations are structural, not a list of sacred field names. Any adequate substrate in this category must make explicit at least these relations:

- Bounded logic units and their local manifestations as LUIs.
- Boundary interfaces, addressable ports, and ordinary in-plane connections.
- Port-level discipline: whether a contact point is pull-shaped, push-shaped, input-facing, or output-facing.
- LU kind as read on the **Execution Plane**, plus the kind-specific organization by which local appearances may be arranged.
- Declared requirement surfaces, including requirement services that group related requirement units under a shared fulfillment surface.
- Fulfillment relations by which compatible suppliers satisfy declared requirement units, whether by Closure binding or by upstream resolution through a reachability path.
- Closure bindings with their internal cores and forwarded ports.
- Target references for LU-defined, host or native, and requirement-backed manifestations.

One distinction should be kept explicit before any shape is read. A LUI must identify what it manifests, but that is not the same question as requirement fulfillment along **Z**. It may manifest another LU, refer to a host or native capability, or stand for a requirement unit declared by the current LU. Only the last case turns a declared requirement into local topology whose eventual satisfaction remains a **Z** relation. The representation must preserve that distinction.

There is a separate caution about LU kind. Different LU kinds need different organization data: ordered steps in a sequential LU, mounted or composed child positions in a structural LU, and so on. The theory should require that distinction, not freeze today's prototype fields as doctrine.

## A Representative Shape

One representative shape is enough to make the category concrete. This is a conceptual silhouette, not a conformance schema or final wire format:

```text
LU
  kind: combinational | sequential | stateful | structural
  core: LUCore
  requirements:
    <RequirementServiceKey>: RequirementService

LUCore
  ports:
    <PortKey>: Port
  luis:
    <LUIKey>: LUI
  connections: Connection[]
  kindOrganization: kind-specific organization data

Port
  polarity: pull | push
  direction: input | output

Connection
  from: PortRef
  to: PortRef

RequirementService
  statefulness: stateless | stateful
  units:
    <RequirementUnitKey>: RequirementUnit

RequirementUnit
  kind: combinational | sequential | stateful | structural
  ports:
    <PortKey>: Port

LUI
  target: LU-defined | host | requirement
  targetRef:
    LU-defined: reference to another LogicIR LU
    host: reference to a host, native, or foreign-runtime capability
    requirement: reference to the root LU's matching RequirementUnit
  manifestedPorts:
    <PortKey>: Port
  fulfillments:
    <RequirementServiceKey>:
      <RequirementUnitKey>: 
        ClosureFulfillment | UpstreamLineageFulfillment

ClosureFulfillment
  closure: Closure

UpstreamLineageFulfillment
  reachabilityPath: ReachabilityPath
  supplierService: RequirementServiceKey
  supplierUnit: RequirementUnitKey

Closure
  core: LUCore
  forwardedPorts: PortKey[]
```

Angle brackets mark keyed collections: `<PortKey>: Port` means a map from scoped port keys to port records. Keys such as `PortKey`, `LUIKey`, `RequirementServiceKey`, and `RequirementUnitKey` are scoped to their containing object, while `PortRef` is globally resolvable. A `RequirementService` is a grouped requirement surface whose units may share stateful fulfillment, not a network or DI service. `forwardedPorts` makes same-key core ports visible outside a `Closure`: reading or emitting through either side is the same interaction.

This is enough to show what "logic as structured data" means: the primary object is no longer a textual projection, but a manipulable topology of units, ports, requirements, fulfillments, and closures. The point is not whether the final object uses exactly these field names. The point is that these relations can exist as structured data, so an editor, verifier, projector, or runtime can consume the same topology instead of each reconstructing the relation from code.

## Representation Boundaries

### Topology, Not Every Implementation

LogicIR does not have to contain every implementation body in order to represent the logic correctly. When compatible logic is explicitly bound as fulfillment to a declared requirement unit, a live Closure is one legitimate way to satisfy that requirement. A host-owned capability instance, legacy function, or native binding may also remain live and host-bound.

What must be represented as structured data is the topology: ports, in-plane connections, requirement surfaces, fulfillment relations, Closure bindings, and upstream reachability paths. The fulfilling logic's own internal realization may remain elsewhere. LogicIR records what requirement exists, what fulfillment relation is in force, and how that relation remains visible to tools and projections.

### Boundary Semantics and Equivalent Fulfillment

Once that structure is explicit, the semantics that matter can be judged where they belong: at the observable boundary of the logic unit. Ports say how data and events cross. LU kind says whether the unit maps, steps, persists, or re-manifests structure across time. Requirement surfaces say what must be fulfilled, and fulfillment relations say whether that satisfaction is Closure-bound or reached upstream.

This matters because substitution is no longer a vague story about pluggability. It is judged against the behavior observed at the host boundary and requirement surface. If timing, failure behavior, ordering, visibility, reachability, or selection behavior changes, the new supplier may no longer be equivalent fulfillment of the same requirement unit. The fulfilling logic changed, and the declared semantics may have changed with it.

### Why This Is Not Just Another IR

The borrowing from compiler IR is deliberate: compiler IRs show the value of a representation less tied to any one surface syntax or target form. LogicIR makes the analogous move at the logical-topology level. It is intermediate not because it is merely lowered from source, but because it mediates among authoring, analysis, verification, projection, and execution while preserving structure that those stages otherwise keep reconstructing.

The name therefore preserves the engineering shorthand of "IR", but this is not ordinary compiler-style lowered IR, not an architecture description language in the usual descriptive sense, and not alternate source syntax with a different skin. A lowered IR arrives after many semantic decisions have already been collapsed. An architecture diagram usually remains descriptive and non-operational. Alternate syntax still leaves the same structure to be inferred if it does not make topology first-class.

LogicIR sits earlier than lowered IR and is stronger than a diagram. It is the place where structural truth is declared rather than merely inferred, recovered, or described after the fact. Its purpose is not downstream repair of medium-imposed damage. Its purpose is to remove, upstream, the representational condition that keeps producing that damage.

## Projection and Adoption

### Relation to Code, Runtime, and Projection

This division clarifies the relation among LogicIR, code, runtime, and projection. LogicIR carries the higher-order logical object. Code remains locally valuable wherever the problem is genuinely local: tight algorithms, host integration, performance kernels, specialized libraries, and realization-dominant detail. Projection is the controlled handoff between them: one explicit topology rendered into a concrete host or runtime path without pretending that the projection is the whole truth of the logic. The same LogicIR may therefore admit multiple projections or realization paths while remaining the same logical object. Runtimes and projectors consume LogicIR; they are not identical with it.

That reassignment of roles also changes what "source" should mean. Machines do not read source in its human authoring form; they consume compiled artifacts, projected host code, bytecode, plans, scheduled transitions, or other realizations. Source exists first as the object people inspect, modify, compare, verify, and compose before it is lowered into execution machinery. The primary representation therefore need not imitate an instruction stream merely because the eventual host will execute one.

For many relations that matter most to reasoning, a schematic graph is closer to the truth than a textual tape: dependency, fan-out, boundary, partial order, declared requirement, fulfillment path, and projection obligation. Electrical engineers do not chiefly reason from PCB routing. They reason from schematics. LogicIR is meant to give computable logic an analogous primary object: explicit topology for human-facing authorship, with textual code retained as one important projection for local realization.

This is the logic-first principle in representational form. The medium should serve the structure the logic actually has, not force that structure to shrink until it fits the carrier. Constraint still matters, but it should arise at explicit boundary and requirement semantics, not from the poverty of the medium itself. LogicIR is not a myth of perfect transmission; it is an attempt at a far less lossy and less biased channel for computable logic.

### Prototype, Orthogonality, and Coexistence

A current prototype already exists, although neither its vocabulary nor its surface schema should yet be treated as final. What it provides is narrower and more useful than premature claims of completion: a validating structured-data substrate in which the required structural category is already operational enough to test. Current prototypes may also expose practical refinements such as explicit temporal step records. Those details may evolve.

The important point is category validation, not schema closure. If the model is right, the question is not whether this first surface is final. The question is whether representing topology, boundary semantics, and fulfillment relations directly gives tools and humans a more faithful object than reconstructing them from text after the fact.

The obvious objection is that real machines are not orthogonal. Correct. Present prototypes are not either. They run through stacks, schedulers, queues, promises, caches, memory cells, serialized transitions, host APIs, and foreign runtimes. But the claim of the model was never that execution substrates literally preserve three immaculate axes internally. The claim is that orthogonality should hold at the LogicIR boundary, where the unit becomes observable to its host and to its tools. Below that boundary, projection engines may inline, batch, reorder, fold, cache, fuse, or otherwise collapse implementation for performance and interoperability. What they may not do is silently change observable behavior at the host boundary while pretending the declared logical semantics remained the same.

LogicIR therefore matters not because it abolishes code, but because it displaces code from exclusive source-of-truth status. It is the representational consequence of taking the model seriously: the shared substrate on which structure, boundary semantics, fulfillment, and projection can be stated directly. Resistance to that move is understandable. Decades of file-centered tooling and instruction-stream habits have trained us to treat the textual projection as the natural home of logic.

LogicIR lowers adoption resistance not by denying that history, but by loosening its monopoly. Legacy code can be wrapped as logical units. Legacy or native capabilities can enter through explicit requirement surfaces and fulfillment relations without being flattened into ordinary dataflow. Explicit topologies can also be projected back into conventional hosts. The bridge runs both ways: existing ecosystems become realization surfaces for a more explicit logical object, rather than worlds that must each redefine the logic from scratch.

# 7. What Explicit Topology Changes

If LogicIR matters, it is not because it makes software easy. Better representation does not abolish essential complexity. Concurrency is still hard. Long-lived state is still hard. Failure, latency, substitution, and coordination are still hard. The claim is narrower and more defensible. When logic has an explicit topological representation, a layer of accidental difficulty stops hiding inside the medium. Problems that used to appear as textual tangles can be restated as questions about boundaries, fulfillment paths, requirement surfaces, and slices. They do not become trivial. They do become more honestly shaped.

The consequences below should be read in that limited sense. They are not a product roadmap and not a claim that one representation dissolves engineering judgment. They show where earlier reconstruction work can move when topology becomes part of the represented object.

## Projection and Realization

The first consequence is projection. Once the logical source of truth is carried by an explicit topology, host environments stop acting like separate ontological worlds and start acting like realization surfaces for the same object. The point is not generic portability. Portability often means rewriting intent into different local idioms and then hoping the behavior is "close enough." The claim here is stricter: the same topology may be realized through different hosts, languages, or engines so long as the declared boundary and fulfillment semantics remain invariant. Code remains important, but its role narrows to local realization under host constraints rather than exclusive definition of the logic itself.

Projection is not only a final lowering step. LogicIR can pass through topology-level passes before a host artifact exists: analysis, verification, specialization, folding, or domain-specific rewriting can consume one explicit topology and either validate it or produce another. The important constraint is that such passes operate on the represented object rather than smuggling structural change into generated code where the topology becomes invisible. Metaprogramming fits the same picture when some LUIs participate at projection time rather than at runtime: their role stays declared in the pipeline instead of becoming an unstructured escape hatch.

Distribution and concurrent execution can then be read as realization choices for a declared logical fabric, not as the shape of the logic itself. Spatial distribution becomes a slice across processes, machines, or environments. Temporal distribution becomes a slice across persistence, suspension, recovery, or resumed execution across time. Push-facing interaction still admits queues, brokers, serialized messages, and other transport machinery, but the broker no longer has to become the logical source of truth. Latency, retry, ordering, persistence, and failure semantics remain; this is not an escape from essential complexity, but a way to make that complexity surface at declared boundaries rather than hide in deployment glue.

## Topology-Level Work

Once the represented object is topology, the natural unit of work shifts from file, call chain, or naming residue toward region, boundary, connection, and fulfillment relation. Authoring and inspection no longer have to reconstruct system shape only from scattered conventions. A change review can be read as "this boundary moved," "this fulfillment path changed," or "this slice now crosses a different seam," rather than merely as a diff through line order. The object of engineering work moves closer to the object that actually governs the system.

This also changes the status of visual programming. A visual editor no longer has to be a graphical wrapper around text or an AST; it can become a native editor for the represented topology itself. Even a read-only level-of-detail view over the same topology is useful: different readers can inspect the same logic at different scales without reconstructing it from text. The issue is not whether boxes and wires are prettier than code, but whether the visual surface represents or manipulates the same object that projection, verification, and execution consume.

Collaboration follows the same geometry. A proposed edit can be a topological patch against a declared region: add this LUI, redirect this connection, replace this fulfillment, move this boundary. Such patches do not remove merge conflicts or design disagreement, but review, blame, and audit can attach to structural regions and relations rather than only to files.

The same structural scope can also carry policy. Tools, agents, or team members might be granted only the regions and relations exposed by declared ports and requirement surfaces, with encapsulated internals hidden behind structural scope rather than protected only by repository or file boundaries. This is not a complete security model, but it changes the unit on which such a model could operate.

## Earlier Validation and Assurance

Type, effect, and resource discipline can move earlier when ports, requirement units, and fulfillment relations are explicit. A host language still enforces its local representation, but the topology can reject structurally invalid connections, missing fulfillments, incompatible substitutions, or invalid capability routes before projection is generated. Lifetimes, ownership seams, cancellation scopes, and batch boundaries can be attached to topology regions or realization boundaries, letting projection engines choose concrete strategies without making those strategies the source of logical truth.

Assurance changes shape for the same reason. When topology is explicit, some testing and QA effort can move upward from compensating for hidden structure to inspecting declared structure directly. One can compare topological snapshots, ask whether a substitution remains equivalent fulfillment rather than silent behavioral drift, verify that a realized boundary still respects declared port interaction and LU kind, or inspect whether a resource lifetime still sits where the design says it should.

This does not replace ordinary tests, performance work, or operational validation. It gives them a more stable structural object to organize around. A line diff is not a topology diff, and a log trace is not a declared structure. Topological snapshots and logic-analyzer-like traces become useful precisely because they can attach observations to ports, connections, fulfillment paths, and temporal slices that were already part of the represented object.

## Speculative Directions

Several further directions follow only as possibilities, and should be read as pressure, not proof.

AI-assisted work is one example: in a text-first world, a machine spends much of its effort reconstructing architecture that the representation never preserved explicitly. A topological substrate changes the unit of interaction from token proximity toward declared regions, boundaries, requirement sites, and semantic-preservation checks. Whether that improves accuracy, latency, or model size is empirical.

Controlled live evolution is more dangerous still: a running system might accept a scoped topology patch, validate it against boundary and fulfillment semantics, observe it at declared boundaries, and then keep, reject, or roll it back. This is not offered as a guarantee; it depends on projection, runtime, and assurance machinery not supplied by the model alone.

## Ecosystem Composability

The broader ecosystem consequence is composability. If logical units carry explicit boundaries, unit kinds, and fulfillment semantics, then reuse depends less on shared language habits and undocumented discipline. The standard-part intuition returns here: components become reusable not merely because their source is packaged better, but because more seams become declared structural relations rather than hidden integration chores. Logic can then be indexed, queried, sliced, and reused as structure rather than merely stored in files and rediscovered through paths. That is not yet software VLSI, but it is a step away from craft-heavy integration and toward a more serious form of composability.

The principle is simple: explicit representation moves structural facts earlier. Consequence, however, is not evidence. What implementation pressure has actually forced must still be separated from what remains open, incomplete, or unproven.

# 8. What Exists, What Does Not

Consequences alone are not enough. What matters now is which of them have actually been forced by implementation pressure already, and which remain open. The distinction matters. Without some implementation record behind it, the proposal risks looking like an elegant redescription of familiar software pain. Without explicit limits, it risks looking like a theory that protects itself by refusing contact with engineering reality. The right calibration is therefore neither triumph nor retreat. It is evidence, not proof.

## What Has Been Forced

What exists today is not a finished ecosystem, not a converged specification, and not a formally settled theory. What exists is implementation evidence: a current runnable LogicIR prototype has already forced certain distinctions into the open, and it should be read as validating evidence rather than as a completed foundation. In that sense, the argument is no longer merely metaphorical. Logic had to become representable as structured data rather than remaining trapped in source text alone. A logic unit had to become a bounded object with explicit ports, in-plane connections, unit kind, kind-specific organization, local LUIs, declared requirement services and units, and explicit fulfillment structure. Local Closure binding and upstream fulfillment through a reachability path had to become different relations rather than different lookup accidents. Runtime realization had to separate from represented topology rather than quietly swallowing it. Those were not decorative modeling preferences. Once logic had to be edited, projected, substituted, and executed as one inspectable object, those distinctions stopped being optional.

## What Remains Provisional

That evidence also needs discipline. Not every visible schema feature deserves immediate promotion into theory. Some parts already look fundamental: explicit ports, explicit in-plane connectivity, explicit unit kind and organization, declared requirement surfaces, explicit fulfillment relations, and a clean split between representation and projection. Other parts still look like the surface of one current implementation: particular port refinements, explicit temporal step records, local handler categories, particular Closure representation machinery, lifecycle identifiers, or one current taxonomy of LUI target categories. That asymmetry matters. The prototype is valuable not because every present field is final, but because even its provisional forms reveal where engineering pressure refused to let structure remain implicit. The common skeleton matters more than the current skin.

## Evidence, Not Mechanics

The same evidence sharpens another point as well. The tri-axial claim is semantic, not mechanical. Orthogonality belongs at the LogicIR boundary, where the logic unit becomes legible to a host, a verifier, an editor, or a projector. Current engines are under no obligation to preserve that separation as three immaculate physical subsystems internally, and they plainly do not. They still collapse onto familiar execution machinery: state stores, listeners, packet dispatch, sequential spines, thenable-style suspension, capability lookup, host callbacks. That does not refute the model. It clarifies what a projector is for. The projector exists to realize one declared topology through ordinary execution means without letting those means become the official description of the logic. Sequence did not survive as the universal representational skeleton. It had to be fenced into one unit kind among others. Fulfillment did not survive as mere naming convention. It had to become an explicit relation from a declared requirement unit, within a requirement service, to compatible satisfying logic, whether by Closure binding or upstream reachability. Pressure came first, vocabulary later. The evidence is therefore constraint evidence: weaker than proof, stronger than coincidence.

## What Remains Open

What does not yet exist is just as important. The model has not been derived from a fully rigorous axiomatic program in which the claimed orthogonality of the axes is proven rather than argued for. The current prototype does not yet justify treating its surface schema as theoretically necessary or final.

Requirement services and units make the target of replacement explicit, but the Z-axis still lacks a mature semantics of equivalent replacement wherever fulfillment changes observable behavior at the host boundary or requirement surface. It is easy to say that compatibility matters; it is much harder to say exactly what counts as equivalent fulfillment without collapsing into vague pluggability or importing an unjustified amount of machinery. The relation between the clean theory and certain pragmatic schema refinements is still unsettled as well. Some distinctions may turn out to be essential. Others may turn out to be convenience.

Distribution as slicing also remains incomplete. There is no finished general account of spatial or temporal cuts that answers placement, recovery, feedback, and boundary-placement questions cleanly. Controlled live evolution, topology-level access control, and pre-runtime effect discipline remain even less settled; they are consequences made thinkable by the representation, not mature guarantees. Identity across scales is unresolved as well: if a topology is sliced, nested, projected, and re-woven, then structural equivalence still needs a firmer account than today's informal handling. And even a sound representation would still fall short as a medium without editors, analyzers, verification tools, and adoption paths.

## Weakening Conditions

A proposal this large should expose its own weakening conditions. It is weakened if the topological account proves no clearer than the inferential burden it claims to remove. It is weakened if ordinary engineers, given ordinary examples, cannot reliably say what has become more visible, more local, or safer to change. It is weakened if the Z-axis cannot be given semantics sharp enough to distinguish equivalent fulfillment from hidden behavioral drift. It is weakened if the current implementation record turns out to be merely one idiosyncratic schema rather than evidence of recurring structural necessity. It is weakened if slicing remains a persuasive metaphor but fails to become a disciplined representational operation. It is weakened if future implementations can collapse these distinctions back into ordinary textual source-of-truth machinery without losing the very clarity the model claims to recover. And it is weakened if the whole approach depends on continual explanatory rescue from its author rather than becoming inspectable in the artifact itself.

## The Earned Claim

That is why the right closing posture here is restrained. Something real seems to be present: not a completed foundation for programming, but a recurring cluster of distinctions that implementation pressure has already made difficult to ignore. The prototype does not prove the theory wholesale. It does something narrower and more important at this stage. It shows that once logic is forced to exist as an explicit object, certain separations keep reasserting themselves while others still look provisional. The argument stands or falls on whether that recurrent pattern is better explained as the return of a suppressed geometry than as a loose pile of unrelated engineering tricks. What remains, after that reduction, is only the claim the essay has actually earned.

# 9. Code Remains, But Not Alone

The claim of this essay is not that code should disappear. **The wager is not that code disappears, but that code stops being the only official body of logic.** Code remains indispensable wherever the problem is genuinely local: algorithms, host integration, low-level control, performance-sensitive realization, and countless forms of engineering detail that are better expressed directly than abstracted upward. The narrower claim is that code has been carrying more logical burden than its medium can represent honestly. The issue is not code's legitimacy. It is its monopoly over the logical source of truth. Code need not remain the sole source of truth for systems whose real structure is already being reconstructed elsewhere.

From that perspective, the historical fragmentation of software looks less like random confusion and less like a tournament waiting for a winner. Functional, reactive, object-oriented, procedural, dependency-injection-heavy, and component-centered traditions can be reread as repeated partial recoveries of dimensions that the dominant medium kept collapsing together. That does not settle the old paradigm arguments. It does change what those arguments appear to have been about.

The comparison to hardware should likewise stay bounded. Software is not hardware, and the argument here is not that programming should become circuit design in disguise. Software keeps its own strengths: fluid realization, rich symbolic expression, host diversity, and the ability to embed local procedure where it is most effective. The relevant lesson from hardware is narrower. It has long benefited from treating connectivity, boundaries, and structural transformation as representationally explicit rather than mentally reconstructed from informal description. Software may need a corresponding increase in topological honesty without ceasing to be software.

This returns to the second body from the beginning of the essay. Engineers have been drawing it for decades and carrying it in diagrams, conventions, runtime scaffolding, architecture documents, and shared mental models because code alone rarely preserved enough visible shape for large systems to remain fully legible. In that sense, it was only second relative to the tooling regime that made text official and structure unofficial. It was not necessarily second in logical importance. If the structure engineers repeatedly reconstruct is real enough to guide design, debugging, substitution, projection, and distribution, then it need not remain informal forever.

That is the smallest durable conclusion this essay earns. Software logic may be less like a sequence than we have trained ourselves to assume and more like a topology that sequence only partially projects. If that is even partly right, then programming should be logic-first rather than medium-first. The medium should serve the structure the logic actually has, not force that structure to shrink until it fits the tape.

The point is not to keep repairing, downstream, problems imposed by the medium. It is to remove, upstream, the representational conditions that keep producing them. Put differently, the task is no longer to become ever more skillful at pushing logic through a lossy, biased channel. It is to build a more structure-preserving one. The question is no longer only how to write better code on the tape. It is what medium can describe logic more directly, without forcing it to split into code and its unofficial supplements.
