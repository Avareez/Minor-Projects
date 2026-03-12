from abc import ABC, abstractmethod
from hero import Hero
from monster import Monster


class MatchResult:
    def __init__(self, winner, loser):
        self.winner = winner
        self.loser = loser

    def __str__(self):
        return f"{self.winner._name} pokonał {self.loser._name}"


class Arena:
    def __init__(self, characters):
        self.characters = characters
        self.history = []

    def fight(self, char1, char2):
        print(f"Walka: {char1._name} vs {char2._name}")
        while char1.is_alive() and char2.is_alive():
            damage = char1.attack()
            char2.defense(damage)
            print(f"{char1._name} zadaje {damage} obrażeń. {char2._name} ma {char2._health} HP.")
            if not char2.is_alive():
                break
            damage = char2.attack()
            char1.defense(damage)
            print(f"{char2._name} zadaje {damage} obrażeń. {char1._name} ma {char1._health} HP.")

        winner = char1 if char1.is_alive() else char2
        loser = char2 if char1.is_alive() else char1
        winner._kills += 1
        winner.level_up()  # Zwiększa poziom bez resetowania zdrowia
        winner.recover_after_fight()  # Odzyskuje zdrowie do max 75%
        self.history.append(MatchResult(winner, loser))
        print(f"Zwycięzca: {winner._name} (HP: {winner._health}/{winner._health_max})")
        print(f"{loser._name} odpada z turnieju!")
        return winner

    def run_tournament(self):
        participants = self.characters[:]
        while len(participants) > 1:
            next_round = []
            for i in range(0, len(participants), 2):
                if i + 1 < len(participants):
                    winner = self.fight(participants[i], participants[i + 1])
                    next_round.append(winner)
                else:
                    next_round.append(participants[i])  # Nieparzysta liczba
            participants = next_round
        print(f"Mistrz turnieju: {participants[0]._name}")