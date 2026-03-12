from abc import ABC, abstractmethod
import random

class Character(ABC):
    def __init__(self, name, health_max, strength, armour, agility):
        self._name = name
        self._health_max = health_max
        self._health = health_max
        self._strength = strength
        self._armour = armour
        self._agility = agility
        self._level = 1
        self._kills = 0

    @abstractmethod
    def attack(self):
        pass

    @abstractmethod
    def defense(self, damage):
        pass

    @abstractmethod
    def level_up(self):
        pass

    def is_alive(self):
        if self._health > 0:
            return True
        else:
            return False

    def recover_after_fight(self):
        recover_limit = self._health_max * 0.75
        if self._health < recover_limit:
            self._health = min(self._health_max, self._health + recover_limit)
        return self._health

    def __str__(self):
        return (f"{self._name} (Level {self._level}): \n"
                f"HP: {self._health}/{self._health_max}, \n"
                f"Strength: {self._strength}, Armour: {self._armour}, Agility: {self._agility}, Kills: {self._kills}")