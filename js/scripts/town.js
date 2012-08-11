// you start by walking up a path with nothing but sand and the ruins of the old world.
// you reach a large gate in a tall defensive wall at the end.

message({
    speaker: oldman,
    text: [
        "You... only those touched by the divine spark can open the gate to this town.",
        "It's been over a hundred years since the last time this has happened...",
        "I can only imagine your purpose. But I thank you for your presence."
    ]
});

message({
    speaker: woman,
    text: [
        "Mirv was the last person like you to show up.",
        "She was very powerful, but she disappeared after she ventured into the tomb world."
    ]
});

// find the entrance into the tomb world...

message({
    speaker: fakeMirv,
    text: [
        "I am Mirv. But those that enter the tomb world are changed forever.",
        "You must be tired. Rest. Join me."
        // fight it
    ]
})

// walk up a staircase past the fakeMirv. real Mirv is encased in crystal. It resonates with your energy and she is freed.
message({
    speaker: mirv,
    text: [
        "So you are Held... you look just like I thought you would.",
        "Thank you for releasing me. We can talk later but for now we need",
        "to return to the surface.",
    ]
})