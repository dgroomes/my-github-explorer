/*
Miscellaneous code that I don't know/care where to put.
*/

// Well this was a bit of a learning journey to get here but I'm satisfied. I'm still building an intuition with
// unions and interfaces. It's run-of-the-mill to use a union of string (like in EnteredToken) but it's cool that I can
// union over a combination of strings and interfaces (and other types).
//
// It didn't come naturally but I think I'm building an intuition for it.
type TokenState = 'empty' | EnteredToken | ValidatedToken

interface EnteredToken {
    kind: 'partial' | 'entered' | 'validating' | 'invalid'
    token: string
}

interface ValidatedToken {
    kind: 'valid'
    token: string
    login: string
}
