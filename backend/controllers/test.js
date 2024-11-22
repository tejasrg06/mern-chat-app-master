let sentence = "Split this sentence into words";
let words = sentence.split(' '); // Split by space

console.log(words); // ["Split", "this", "sentence", "into", "words"]
function findCommonItemsWithIndices(array1, array2) {
    let commonItemsIndices = [];
    
    // Create a Set from array2 for faster lookup
    let set2 = new Set(array2);

    // Iterate over array1 and check if each element exists in array2
    array1.forEach((item, index1) => {
        if (set2.has(item)) {
            // If found in array2, store the index in array1
            commonItemsIndices.push(index1);
        }
    });

    return commonItemsIndices;
}
let sensitive=['Split']

let res=findCommonItemsWithIndices(words,sensitive)

for (let sen in res){
    words[sen]="****"
}
sentence=words.join(" ")
console.log(sentence)