import { withParentSize } from '@vx/responsive';

function Chart({ data, parentWidth, parentHeight }) {
  const margin = {
    top: 15,
    bottom: 40,
    left: 0,
    right: 0,
  };
  const width = parentWidth - margin.left - margin.right;
  const height = parentHeight - margin.top - margin.bottom;

  return (
    <div>
      <svg width={width} height={height}>
        <rect width={width} height={height} fill="steelblue" />
      </svg>
    </div>
  );
}

export default withParentSize(Chart);
