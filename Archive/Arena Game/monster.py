from character import Character
import random

class Monster(Character):
    def attack(self):
        damage = random.randint(self._strength // 2, self._strength)
        if self._health < self._health_max * 0.9:
            damage = int(damage * 1.3)  # +30% przy <90% HP
        print("\t",damage)
        return damage

    def defense(self, damage):
        reduced_damage = max(0, int(damage - self._armour * 0.9))  # Naturalna odporność
        self._health = max(0, self._health - reduced_damage)
        print("\t",reduced_damage)
        return reduced_damage

    def level_up(self):
        self._level += 1
        self._strength += 7
        self._health_max += 15
        print(f"{self._name} staje się silniejszy (poziom {self._level})!")