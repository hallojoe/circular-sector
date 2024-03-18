import { ICircularSectorViewModel } from "./Interfaces";
import { Alignments } from "./enums";


export function convertAnchorPointsToRectangular(viewModels: ICircularSectorViewModel[], size: number = 512, alignment: Alignments = Alignments.Center): ICircularSectorViewModel[] {

  const widths = viewModels.map(viewModel => viewModel.ratio * (viewModel.radius * 2));

  const totalWidth = widths.reduce((previousValue: number, value: number) => value + previousValue, 0);

  let x = alignment === Alignments.Center ? (size / 2) - (totalWidth / 2) : 0;

  return viewModels.map((viewModel, index) => {

    const gap = viewModel.source.gap;
    const halfGap = gap / 2;

    const width = (viewModel.ratio * totalWidth) - gap;
    const halfWidth = width / 2;

    const startAngle = viewModel.source.theta;


    const startX = (x + halfGap);
    const midX = (startX + halfWidth);
    const endX = (startX + width);

    const radius = viewModel.source.radius;

    let midY = viewModel.source.center.y; // size / 2
    let startY = midY - radius;
    const endY = midY + radius;

    if (viewModel.source.height > 0) {
      startY = endY - viewModel.source.height;
      midY = endY - (viewModel.source.height / 2);
    }

    x = endX + halfGap;

    return {
      ...viewModel,
      anchors: {
        outer: {
          start: { x: startX, y: startY },
          mid: { x: midX, y: startY },
          end: { x: endX, y: startY }
        },
        middle: {
          start: { x: startX, y: midY },
          mid: { x: midX, y: midY },
          end: { x: endX, y: midY }
        },
        inner: {
          start: { x: startX, y: endY },
          mid: { x: midX, y: endY },
          end: { x: endX, y: endY }
        }
      }
    };

  });

}
