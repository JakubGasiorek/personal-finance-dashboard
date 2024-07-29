export const colors = [
  "rgba(75, 192, 192, 0.6)", // teal
  "rgba(153, 102, 255, 0.6)", // purple
  "rgba(255, 159, 64, 0.6)", // orange
  "rgba(255, 99, 132, 0.6)", // red
  "rgba(54, 162, 235, 0.6)", // blue
  "rgba(255, 206, 86, 0.6)", // yellow
];

export const getColorForCategory = (
  category: string,
  colorMap: Record<string, string>
) => {
  if (!colorMap[category]) {
    // Assign a new color from the color list
    colorMap[category] = colors[Object.keys(colorMap).length % colors.length];
  }
  return colorMap[category];
};
