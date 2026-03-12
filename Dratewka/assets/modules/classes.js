export class Location {
    xy;
    name;
    src;
    color;
    dir;
    items;

    constructor(xy, name, src, color, dir, items) {
        this.xy = xy;
        this.name = name;
        this.src = src;
        this.color = color;
        this.dir = dir;
        this.items = items;
    }
};

export class Item {
    id;
    name;
    flag;
    codename;
    location;

    constructor(id, name, flag, codename, location) {
        this.id = id;
        this.name = name;
        this.flag = flag;
        this.codename = codename;
        this.location = location;
    }
};