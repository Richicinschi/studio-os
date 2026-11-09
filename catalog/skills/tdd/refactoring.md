# What to look for when refactoring

With the tests green, scan for these smells:

- **Repeated code**: pull it into a shared function or class.
- **A very long method**: split it into private helpers. Leave the tests on the public interface.
- **Thin, shallow modules**: merge them, or give them more to do behind a smaller surface.
- **Feature envy**: move the logic next to the data it uses.
- **Primitive obsession**: wrap loose strings and numbers in small value types.
- **Older code that the new code shows up as awkward**.

Change one thing, run the tests, then change the next.
