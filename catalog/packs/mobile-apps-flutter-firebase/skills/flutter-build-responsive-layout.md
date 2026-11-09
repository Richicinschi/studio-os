---
id: flutter-build-responsive-layout
title: Responsive Flutter layouts
description: Use when you need a Flutter screen to adapt to different sizes with LayoutBuilder, MediaQuery or Expanded/Flexible, looking good on both mobile and tablet/desktop form factors.
---

# Responsive Flutter layouts

## When to use

- "Make this screen work on tablet and desktop", "it stretches too wide", "add a sidebar on big screens".
- A Row or Column overflows when the window is resized.
- Someone proposes checking "is this a tablet" or locking the orientation.

Neighbours: a render overflow you must diagnose belongs to `flutter-fix-layout-issues`; a screen that needs its own route table belongs to `flutter-setup-declarative-routing`.

## How it works

1. Measure the window, not the device. `MediaQuery.sizeOf(context)` gives the whole app window. `LayoutBuilder` gives the space the parent actually hands this subtree, so use it for local choices and read `constraints.maxWidth`.
2. Decide on space only. Do not branch on orientation (`MediaQuery.orientationOf`, `OrientationBuilder`) near the top of the tree, and do not branch on "phone" versus "tablet". Windows get resized, split, floated and shown in picture-in-picture, so a device label tells you nothing about the room you have.
3. Build one adaptive screen by choosing the single widget whose shape has to change and wrapping it in a `LayoutBuilder`. Compare `constraints.maxWidth` with a named breakpoint constant. Wider than the breakpoint: return the wide shape, a `Row` with navigation on the left and the content filling the rest. At the breakpoint or narrower: return the narrow shape, one column or the usual stacked navigation. The example below uses 720 logical pixels; the Material window size classes switch from a bottom bar to a navigation rail at 600, the other common choice (check the vendor's current documentation for the class boundaries).
4. Remember the layout rule: constraints go down, sizes go up, the parent sets the position. Inside a `Row`, `Column` or `Flex`:
   - `Expanded` takes all leftover space. It is a `Flexible` with a tight fit and flex 1.
   - `Flexible` lets a child be as large as it wants up to its share. The `flex` numbers split leftover space between siblings in proportion.
5. Look for content that looks silly when wide: long lists, paragraphs, forms. Cap each one with a `ConstrainedBox` that sets a `maxWidth`, and put that inside a `Center` so it stays in the middle. Treat the numbers as starting points to tune by eye, not measured values (a form often reads well at 400 to 600, a reading column at about 680). A `GridView` or `ListView` is capped the same way, with a `ConstrainedBox` or, when you also want a background colour, a `Container`.
6. Never hard-code a column count from a device label such as tablet; let the window width decide it.
7. Always use the builder constructors, `ListView.builder` or `GridView.builder`, whenever the item count is large or unknown, so only visible rows are built. To turn a long single-column list into a grid that adds columns as the window grows, use `GridView.builder` with `SliverGridDelegateWithMaxCrossAxisExtent`.
8. Do not lock the orientation. On foldables and large Android screens a lock produces letterboxing (the app in the middle with empty bars), and Android's large-screen guidance expects both portrait and landscape. If a product requirement truly forces a lock, read the physical screen size from the Display API (the `display` of the current `View`, found with `View.maybeOf(context)`), because after the device unfolds `MediaQuery` can keep reporting the small compatibility window instead of the real one.
9. Support more than touch: mouse and trackpad hover and scroll, keyboard shortcuts, visible focus and tab order, and touch targets that stay comfortably large.
10. Verify by running the analyzer, then resizing a desktop or web window slowly through the breakpoint and back, watching for overflow stripes, jumpy transitions and content that stretches edge to edge.

### Example 1: switch shape at a breakpoint

```dart
import 'package:flutter/material.dart';

const double kWideBreakpoint = 720;

class ShellScreen extends StatelessWidget {
  const ShellScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, box) {
        final wide = box.maxWidth > kWideBreakpoint;
        const content = Placeholder(color: Colors.teal);
        if (!wide) return content;
        return const Row(
          children: [
            SizedBox(width: 280, child: Placeholder(color: Colors.indigo)),
            VerticalDivider(width: 1),
            Expanded(child: content),
          ],
        );
      },
    );
  }
}
```

### Example 2: readable width on big windows

```dart
import 'package:flutter/material.dart';

class ReadableList extends StatelessWidget {
  const ReadableList({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 680),
          child: ListView.builder(
            itemCount: 40,
            itemBuilder: (context, i) => ListTile(title: Text('Row $i')),
          ),
        ),
      ),
    );
  }
}
```

## Checks before done

- `flutter analyze` is clean.
- The window was resized across the breakpoint with no overflow stripes.
- No code reads orientation or device type to choose a layout.
- Wide screens do not show full-width text, forms or single-column lists.
- Long lists use builder constructors.
- Orientation is not locked (or the lock is a stated requirement and the Display API is used).
- Mouse and keyboard work, not just touch.
