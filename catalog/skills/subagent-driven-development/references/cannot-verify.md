# Items the reviewer could not verify

Companion to subagent-driven-development.

A task reviewer works from the diff alone. A requirement that lives in code the diff leaves out, or that stretches over several tasks, comes back marked "⚠️ Cannot verify from diff". These marks do not stop the rest of the review. You must resolve each one before the task is complete, because you hold the whole plan and the neighbouring tasks, and the reviewer does not.

Resolve each item yourself. A confirmed gap is handled like any spec failure: add it to the findings that go into the fix loop.
