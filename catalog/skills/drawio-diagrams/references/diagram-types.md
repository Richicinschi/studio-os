# Diagram types

Read this when the request names a kind of diagram, or when you are picking shapes and a flow
direction for a new one. Each section fixes the structural keywords for one kind. A user style
preset (see `style-presets.md`) adds colours, fonts, edge style and extras on top of them.

Kinds covered: ERD, UML class, sequence, architecture, ML model, flowchart.

Base keys: unless a row says otherwise, add `html=1;whiteSpace=wrap;` to every vertex style
below, and `html=1;` to every edge style. They are left out of the rows to keep them short.

## ERD (entity-relationship)

| Part | Style | Remark |
|---|---|---|
| Table | `shape=table;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;startSize=30;fontStyle=1;strokeColor=#6c8ebf;fillColor=#dae8fc;` | A table is a container. |
| Column row | `shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;collapsible=0;dropTarget=0;fillColor=none;portConstraint=eastwest;points=[[0,0.5],[1,0.5]];fontSize=12;` | Child of the table, so `parent` is the table id. |
| Primary-key row | add `fontStyle=1;` | Also start the label with `PK`, or use a key icon. |
| Foreign-key link | `dashed=1;startArrow=ERmandOne;endArrow=ERmandOne;` | Pick the crow's-foot ends that match the cardinality. |
| Layout | Top to bottom; tables roughly 300 px apart | Keep related tables in a column. |

## UML class

| Part | Style | Remark |
|---|---|---|
| Class box | `swimlane;startSize=26;align=center;fontStyle=1;` | Three compartments: name, attributes, operations. |
| Divider | `line;rotatable=0;points=[];portConstraint=eastwest;labelPosition=left;verticalAlign=middle;align=left;spacingLeft=3;spacingRight=10;spacingTop=-1;fillColor=none;strokeWidth=1;` | Between compartments. |
| Inheritance | `endArrow=block;endFill=0;` | Open triangle at the parent. |
| Interface realisation | `dashed=1;endArrow=block;endFill=0;` | Dashed line, open triangle. |
| Aggregation (whole has parts) | `endFill=0;endArrow=diamondThin;` | Empty diamond at the whole. |
| Composition (parts die with the whole) | `endFill=1;endArrow=diamondThin;` | Solid diamond at the whole. |
| Layout | Top to bottom; classes roughly 250 px apart | Interfaces sit above their implementers. |

## Sequence

| Part | Style | Remark |
|---|---|---|
| Participant | `shape=umlLifeline;perimeter=lifelinePerimeter;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;portConstraint=eastwest;` | A head box with a dashed line below. |
| Synchronous call | `verticalAlign=bottom;endArrow=block;` | Solid line, filled head. |
| Asynchronous call | `verticalAlign=bottom;dashed=1;endArrow=open;` | Dashed line, open head. |
| Reply | `verticalAlign=bottom;dashed=1;endArrow=open;strokeColor=#999999;` | Dashed and grey. |
| Activation bar | `shape=umlFrame;whiteSpace=wrap;` | A thin box drawn over the lifeline. |
| Layout | Left to right; lifelines roughly 200 px apart | Time runs down the page. |

## Architecture

| Part | Style | Remark |
|---|---|---|
| Tier | `swimlane;startSize=30;` | One container per layer, such as Client, API, Service and Data. |
| Service | `rounded=1;` plus the tier colour | Colour by tier. |
| Database | `shape=cylinder3;` | Green. |
| Queue or bus | `rounded=1;fillColor=#fff2cc;strokeColor=#d6b656;` | Yellow; place it centrally as the hub. |
| Gateway or balancer | `rounded=1;` in orange, or an `mxgraph.aws4` icon | Orange. |
| External system | `rounded=1;dashed=1;fillColor=#f5f5f5;strokeColor=#666666;` | Dashed outline. |
| Layout | Top to bottom or left to right, by tier count; four or more tiers go top to bottom | Hubs in the middle. |

## ML or deep-learning model

For network-architecture figures in papers.

| Part | Style | Remark |
|---|---|---|
| Layer block | `rounded=1;` plus a colour for its type | The basic unit. |
| Input or output | `fillColor=#d5e8d4;strokeColor=#82b366;` | Green. |
| Convolution or pooling | `fillColor=#dae8fc;strokeColor=#6c8ebf;` | Blue. |
| Attention or transformer | `fillColor=#e1d5e7;strokeColor=#9673a6;` | Purple. |
| RNN, LSTM or GRU | `fillColor=#fff2cc;strokeColor=#d6b656;` | Yellow. |
| Linear or fully connected | `fillColor=#ffe6cc;strokeColor=#d79b00;` | Orange. |
| Loss or activation | `fillColor=#f8cecc;strokeColor=#b85450;` | Red. |
| Skip connection | `curved=1;dashed=1;endArrow=block;` | A dashed curve. |
| Tensor label | A second line in the label, for example `value="Linear&#xa;(B, 512)"` | Join lines with `&#xa;`. |
| Layout | Top to bottom; layers roughly 150 px apart | Put encoder and decoder in swimlanes. |

Tensor shapes: under each layer name write its input or output dimensions, in the form
`(B, C, H, W)` or `(B, T, D)`, as the label's second line.

## Flowchart

| Part | Style | Remark |
|---|---|---|
| Start or end | `ellipse;fillColor=#d5e8d4;strokeColor=#82b366;` | Green oval. |
| Step | `rounded=0;fillColor=#dae8fc;strokeColor=#6c8ebf;` | Blue rectangle. |
| Decision | `rhombus;fillColor=#fff2cc;strokeColor=#d6b656;` | Yellow diamond. |
| Input or output | `shape=parallelogram;perimeter=parallelogramPerimeter;fillColor=#ffe6cc;strokeColor=#d79b00;` | Orange slanted box. |
| Sub-process | `rounded=0;fillColor=#e1d5e7;strokeColor=#9673a6;` plus a double border | Purple. |
| Branch labels | `value="Yes"` and `value="No"` on the edges leaving a decision | Label every branch. |
| Layout | Top to bottom; rows roughly 200 px apart | Branches go sideways and rejoin in the centre. |
