## Summary

<!-- What changes and why. One or two sentences. -->

## Defect IDs

<!--
Which defects from AGENTS.md section 5 does this fix (B-01..B-04, D-01..D-06, P-01..P-06)?
If none, write "none".
-->

## Gates

<!--
Paste real output. "Should work" is not a result. Delete rows you did not run and say why
under "Not verified".
-->

```
typecheck  exit
build      exit
test       /42 pass
lint       N errors, M warnings   (baseline 62/57)
```

## Runtime verification

<!--
Run the built binary. Reading the source is not verification.
A change touching `create` MUST be exercised under a real PTY with a timeout bound —
see AGENTS.md section 6.
-->

```
<exact command> → <observed output>, exit <code>
```

## Not verified

<!-- Anything you could not run, and why. Never leave this implicit. -->

## Spec impact

<!--
Did any requirement in openspec/specs/ change status? Promoting [UNTESTED] to [VERIFIED],
or dropping a [BROKEN] tag, requires the run output above as evidence.
-->
