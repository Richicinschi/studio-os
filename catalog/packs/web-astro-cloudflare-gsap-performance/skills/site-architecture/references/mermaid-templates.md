# Mermaid Diagram Templates

Ready-to-paste Mermaid sketches for sitemaps. Swap in your own labels and edges. The sample site is an imaginary scheduling app.

---

## Names and URLs

A top-down tree; each node carries a page name and its path.

```mermaid
graph TD
    HOME["Home<br/>/"] --> PROD["Product<br/>/product"]
    HOME --> PLANS["Plans<br/>/plans"]
    HOME --> NOTES["Notes<br/>/notes"]
    HOME --> TEAM["Team<br/>/team"]

    PROD --> P1["Booking<br/>/product/booking"]
    PROD --> P2["Calendars<br/>/product/calendars"]
    PROD --> P3["Payments<br/>/product/payments"]

    NOTES --> N1["Note: No-shows<br/>/notes/no-shows"]
    NOTES --> N2["Note: Buffers<br/>/notes/buffers"]
```

---

## Navigation zones

Each subgraph is one area of the interface, so you can see where a page is linked from.

```mermaid
graph TD
    subgraph "Header Nav"
        HOME["Home"]
        PROD["Product"]
        PLANS["Plans"]
        NOTES["Notes"]
        CTA["Book a demo ★"]
    end

    subgraph "Product Pages"
        P1["Booking"]
        P2["Calendars"]
        P3["Payments"]
    end

    subgraph "Footer Nav"
        TEAM["Team"]
        JOBS["Jobs"]
        HELP["Help"]
        PRIV["Privacy"]
        TOS["Terms"]
    end

    HOME --> PROD
    HOME --> PLANS
    HOME --> NOTES
    PROD --> P1
    PROD --> P2
    PROD --> P3
    HOME --> TEAM
    TEAM --> JOBS
    HOME --> HELP
```

---

## URL labels

Same idea with the path in small type under the name.

```mermaid
graph TD
    HOME["Home<br/><small>/</small>"] --> SOL["Solutions<br/><small>/solutions</small>"]
    HOME --> PLANS["Plans<br/><small>/plans</small>"]
    HOME --> LEARN["Learn<br/><small>/learn</small>"]
    HOME --> DEV["Developers<br/><small>/developers</small>"]

    SOL --> S1["Clinics<br/><small>/solutions/clinics</small>"]
    SOL --> S2["Salons<br/><small>/solutions/salons</small>"]

    DEV --> D1["Quickstart<br/><small>/developers/quickstart</small>"]
    DEV --> D2["REST reference<br/><small>/developers/rest</small>"]
```

---

## Hub and spoke

One central guide with its supporting articles. The dotted arrows are links between neighbouring spokes.

```mermaid
graph TD
    HUB["Pricing Strategy<br/>(Hub Page)"]

    HUB --> S1["Cost Floors"]
    HUB --> S2["Tier Design"]
    HUB --> S3["Discount Rules"]
    HUB --> S4["Annual Plans"]

    S1 -.-> S2
    S2 -.-> S3
    S3 -.-> S4

    style HUB fill:#f9f,stroke:#333,stroke-width:2px
```

Reading it: a solid line joins the hub to a spoke; a dashed line joins two spokes.

---

## Linking flow

Which sections send readers to which. Left-to-right layout.

```mermaid
graph LR
    subgraph "Sales"
        HOME["Home"]
        PROD["Product"]
        PLANS["Plans"]
    end

    subgraph "Editorial"
        NOTES["Notes"]
        PLAY["Playbooks"]
        STORY["Customer Stories"]
    end

    subgraph "Support"
        HELP["Help Centre"]
        REF["Reference"]
        STATUS["Release Log"]
    end

    NOTES --> PROD
    NOTES --> STORY
    STORY --> PROD
    STORY --> PLANS
    PROD --> HELP
    PLAY --> NOTES
    PLAY --> HELP
    HOME --> PROD
    HOME --> NOTES
    HOME --> STORY
```

---

## Before and after

Put the current structure beside the proposed one to show what a restructure changes.

```mermaid
graph TD
    subgraph "Before"
        B_HOME["Home"] --> B_1["Page 1"]
        B_HOME --> B_2["Page 2"]
        B_HOME --> B_3["Page 3"]
        B_HOME --> B_4["Page 4"]
        B_HOME --> B_5["Page 5"]
        B_HOME --> B_6["Page 6"]
        B_HOME --> B_7["Page 7"]
        B_HOME --> B_8["Page 8"]
        B_HOME --> B_9["Page 9"]
    end

    subgraph "After"
        A_HOME["Home"] --> A_S1["Services"]
        A_HOME --> A_S2["Learn"]
        A_HOME --> A_S3["About"]
        A_S1 --> A_1["Service A"]
        A_S1 --> A_2["Service B"]
        A_S1 --> A_3["Service C"]
        A_S2 --> A_4["Articles"]
        A_S2 --> A_5["FAQ"]
        A_S3 --> A_6["Story"]
        A_S3 --> A_7["Contact"]
    end
```

---

## Colour coding

Fill colours can show the status of each page in a restructure.

```mermaid
graph TD
    HOME["Home"] --> SVC["Services"]
    HOME --> PRICE["Prices"]
    HOME --> LOG["Journal"]
    HOME --> NEW["Shop (new)"]
    HOME --> OLD["Old Promo"]

    SVC --> S1["Existing Service"]
    SVC --> S2["New Service"]

    style HOME fill:#4CAF50,color:#fff
    style PRICE fill:#4CAF50,color:#fff
    style SVC fill:#4CAF50,color:#fff
    style LOG fill:#4CAF50,color:#fff
    style S1 fill:#4CAF50,color:#fff
    style NEW fill:#2196F3,color:#fff
    style S2 fill:#2196F3,color:#fff
    style OLD fill:#f44336,color:#fff
```

Key:
- Green `#4CAF50`: page stays as is
- Blue `#2196F3`: page to be written
- Red `#f44336`: page to delete or redirect
- Yellow `#FFC107`: page to move or rework
- Purple `#9C27B0`: top-priority or call-to-action page
