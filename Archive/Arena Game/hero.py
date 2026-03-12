from character import Character
import random

class Hero(Character):
    def attack(self):
        damage = random.randint(self._strength // 2, self._strength)
        if self._health > self._health_max * 0.9:
            damage = int(damage * 1.2)  # +20% przy >90% HP
        # Szansa na dodatkowy cios
        extra_chance = 10 + self._level * 2  # 10% + 2% za poziom
        if random.randint(1, 100) <= extra_chance:
            damage += random.randint(self._strength // 4, self._strength // 2)
            print(f"{self._name} wykonuje dodatkowy cios!")
        print("\t", damage)
        return damage

    def defense(self, damage):
        if random.randint(0, self._agility) > 0.8*self._agility:
            print(f"{self._name} unika ciosu!")
            return 0
        reduced_damage = max(0, damage - self._armour)  # Lepsza redukcja
        self._health = max(0, self._health - reduced_damage)
        print("\t",reduced_damage)
        return reduced_damage

    def level_up(self):
        self._level += 1
        self._strength += 5
        self._health_max += 10
        self._agility += 2
        print(f"{self._name} awansuje na poziom {self._level}!")