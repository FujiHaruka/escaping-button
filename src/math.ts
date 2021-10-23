type Point = {
  x: number;
  y: number;
};

type Box = {
  width: number;
  height: number;
};

export const calcDistance = (p1: Point, p2: Point) => {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
};

export const pointOnCircumference = (
  center: Point,
  radius: number,
  angle: number
) => {
  return {
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle),
  };
};

export const mostDistantPoint = (
  target: Point,
  center: Point,
  radius: number,
  box: Box
) => {
  const distance = calcDistance(target, center);
  return Array.from({ length: 100 })
    .map((_, i) => (2 * Math.PI * i) / 100)
    .map((angle) => pointOnCircumference(center, radius, angle))
    .filter(
      (point) =>
        point.x > 50 &&
        point.y > 50 &&
        point.x < box.width - 50 &&
        point.y < box.height - 50
    )
    .map((point) => ({
      point,
      // ちょっとランダム要素を入れる
      distance: calcDistance(target, point) + (Math.random() * distance) / 10,
    }))
    .sort((c1, c2) => c1.distance - c2.distance)
    .pop()!.point;
};
