## Same as 2, but with implicit exception propagation and escalation

### Proposal

The idea is to explicitly declare exceptions thrown by functions, using the `throws` keyword:

```js
function myFunction (myParam) throws myException1, myException2 {
```

If a function tries to throw an exception that is not declared in its definition, it will throw an error instead.

### Pros

- We know by looking at the function definition every exceptions it can possibly throw, in one glance
- The expected exceptions are specified in one place only
- Useful for intellisense and self-documented code
- Automatically escalate any unexpected exception before leaving the function scope: everything stays encapsulated

### Cons

- Difficult to know what the function can possibly throw when calling it somewhere

