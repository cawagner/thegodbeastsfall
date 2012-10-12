define([], function() {
    "use strict";

    // for when text gets wacky thanks to entropy
    var capitalizeFirstLetter = function(string) {
        return string.charAt(0).toUpperCase() + string.substr(1);
    };

    var piglatinize = function(string) {
        return string.replace(/[A-Z]+/ig, function(word) {
            var firstVowel = word.search(/[aeiou]/i);
            var isCapitalized = word.match(/^[A-Z]/) !== null;
            var firstPart;

            if (firstVowel <= 0) {
                    return word + "-way";
            } else {
                    firstPart = word.substr(firstVowel);
                    // TODO: handle all-caps words appropriately...
                    if (isCapitalized) {
                        firstPart = capitalizeFirstLetter(firstPart);
                    }
                    return firstPart + word.substr(0, firstVowel).toLowerCase() + "ay";
            }
            return word;
        });
    };

    var vowelShuffle = function(string) {
        return string.replace(/[A-Z]+/ig, function(word) {
            var vowels = word.match(/[aeiou]/g);
            var i = 0;
            return word.replace(/[aeiou]/g, function(vowel) {
                ++i;
                var index = (i+4) % vowels.length;
                vowel = vowels[index];
                vowels.splice(index, 1);
                return vowel;
            });
        });
    };

    var oxford = function(string) {
        return string.replace(/[A-Z]+/ig, function(word) {
            var middleLength = word.length - 2;
            if (word.length <= 3) {
                return word;
            }
            return word.substring(0, 1) + word.substring(1, middleLength).split("").sort(function(){ return Math.random(); }).join("") + word.substring(middleLength);
        });
    };

    return {
        capitalizeFirstLetter: capitalizeFirstLetter,
        piglatinize: piglatinize,
        vowelShuffle: vowelShuffle,
        oxford: oxford
    };
})