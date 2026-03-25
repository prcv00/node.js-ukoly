const random = Math.floor(Math.random() * 10) + 1
let attempts = 0
let guess
while (attempts < 5) {
	console.log("Hádej jaké číslo si myslím:")
	guess = parseInt(prompt("Zadej číslo:"))
	if (guess === random) {
		console.log("Gratuluji, uhádl jsi číslo!")
		break;
	} else if (guess < random) {
		console.log("Číslo je větší!")
		attempts++
	} else if (guess > random) {
		console.log("Číslo je menší!")
		attempts++
	}
}
if (attempts === 5) {
	console.log("Vyčerpal jsi 5 pokusů. Správné číslo bylo:", random)
}