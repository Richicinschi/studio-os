# Budget math

Use this at step 9 and in plan sections 8 and 10. Pick one budget method and write out every step. No spend percentage in this file is a measured fact. Whatever share or range you use comes from the person, from the company's own history, or from a source you fetched and name.

## Decisions to make

1. Which single route: spend-first (pick a spend, compute what it yields) or goal-first (pick a revenue target, compute the spend). Goal-first is the better default when there is no acquisition-cost history, when the plan will be shown to investors, or when revenue-based financing is involved. It also suits seed to Series A, because it shows whether the target is funded at all.
2. The blended acquisition cost, and whether it is known. If it is unknown, say so and put it first in the open decisions. Every projection depends on it.
3. Revenue per customer and annual retention, taken from the unit economics table in section 8.
4. Spend-first only: the share of annual recurring revenue (ARR). Ask the person for their ceiling, or let them choose a range. To ground the share, read the sales and marketing line in annual reports of listed companies in the same category, as a share of their revenue; name the reports you used. A low share beside a promise of fast multiplication is a contradiction to flag, not to smooth over.
5. The size of the experiment buffer.
6. Venture-backed companies above 1M ARR only: whether to compare the plan with the company's own growth path (see below).
7. How the forecast is presented.

## What counts as acquisition cost

Blended CAC is total marketing cost in a period divided by new customers in the same period. Include loaded salaries of marketing staff, ad spend, marketing software, content production (writers, designers, video), agency and contractor retainers, salaries of outbound sellers, and CRM, automation and analytics tools. A company that buys no ads still pays for founder time, contractors and events, so its CAC is not zero. With no history, use a year of revenue from the cheapest paid plan as a placeholder budget, then measure and replace it next cycle.

## Route A: spend-first

1. Budget = chosen share x ARR.
2. Customers acquired = budget / blended CAC.
3. Gross new ARR = customers x (monthly revenue per customer x 12).
4. Net new ARR = gross new ARR x annual retention. One retention discount for the whole year is a simplification; say so.
5. Ending ARR = starting ARR + net new ARR.

## Route B: goal-first

1. Gap = target ARR minus current ARR.
2. Annual revenue per customer = monthly revenue x 12.
3. Customers needed = gap / annual revenue per customer, rounded up.
4. Raw cost = customers needed x blended CAC.
5. Budget = raw cost / annual retention.

Route A multiplies by retention because it forecasts what spend yields. Route B divides because it grosses up what a target requires so churned customers are replaced. The opposite directions are intended. Walk through the steps with the inputs whenever the figure is questioned.

## Example (invented company, invented numbers)

Inputs: ARR 600,000; blended CAC 90; revenue per customer 25 per month (300 a year); retention 85 percent; target ARR 900,000; currency is the client's.

Route A at 10 percent: budget 60,000; 666 customers; gross new ARR 199,800; net 169,830; ending ARR 769,830. The 900,000 target is missed, so 10 percent does not fund it.

Route B: gap 300,000; 300 per customer; 1,000 customers; raw cost 90,000; budget 90,000 / 0.85 = 105,882, which is 17.6 percent of ARR.

## Experiment buffer

Add a percentage to the computed budget. Size it to how shaky the CAC is: a measured CAC needs little, a guessed one needs more. The buffer also pays for trying the next channel before the current one flattens. With 15 percent on the example: 105,882 x 1.15 = 121,764.

## Own-history growth path

Only for venture-backed companies above 1M ARR. Build it from the last four quarters, list assumptions, and say why the plan is faster or slower than that history. Other companies use linear adds or step targets (see growth-shapes.md).

## Presenting the forecast

Give an annual budget, a year-end goal, an actionable 90-day plan, monthly figures marked illustrative, and a quarterly review. Below very large scale every forecast is an estimate; review what each quarter taught instead of defending monthly variance.

## Where the output lands

Section 3: monthly spend by line and share of ARR. Section 8: unit economics. Section 10: method, budget, goal, growth path comparison. Section 11: budget split across the five funnel stages. Section 13: unknown CAC as top open decision.
