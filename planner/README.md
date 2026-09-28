# Digital Planner

A calm, neutral-toned digital planner that works on phone, iPad and laptop. It is built with plain HTML, CSS and JavaScript, with no build step.

## Sections

| Tab | What it holds |
| --- | --- |
| Home | Today's date, today's schedule and priorities, a daily note, quick links |
| Calendar | Month grid with a note for each day (a scrolling day list on phones) |
| Overview | Monthly focus, goals, important dates, to-dos and reflection |
| Weekly | The weekly plan: a 6AM–9PM schedule, top priorities, tasks, dotted notes, a habit tracker and this week's focus |
| Wellness | Daily mood, sleep, water and movement, weekly averages, self-care list |
| Finance | Monthly income and expenses (budget vs actual), totals, savings goal |
| Goals | Six goals, each with a reason, five steps and a progress bar |
| Notes | A notebook with as many dotted-paper notes as you like |
| Extras | Reading list, gratitude, brain dump, theme, currency, backup and restore |

Use the ‹ › arrows to move between weeks and months. Every week and month keeps its own pages.

## Saving your data

Everything saves automatically in the browser on that device (`localStorage`). To move your planner to another device, open **Extras → Download backup**, then use **Restore backup** on the other device.

## Using it on a phone or iPad

Host the folder somewhere (for example GitHub Pages), open it in Safari or Chrome, then choose **Share → Add to Home Screen**. It opens full screen like an app and works offline.

## Run locally

```sh
cd planner
python3 -m http.server 8000
# open http://localhost:8000
```
