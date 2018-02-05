import { withParentSize } from '@vx/responsive';
import { scaleTime, scaleLinear } from '@vx/scale';
import { LinePath, AreaClosed, Bar, Line } from '@vx/shape';
import { LinearGradient } from '@vx/gradient';
import { AxisBottom } from '@vx/axis';
import { withTooltip, Tooltip } from '@vx/tooltip';
import { localPoint } from '@vx/event';
import { bisector } from 'd3-array';
import formatDate from '../utils/formatDate';

import formatPrice from '../utils/formatPrice';
import MaxPrice from './maxprice';
import MinPrice from './minprice';

class Chart extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {
      data,
      parentWidth,
      parentHeight,
      tooltipLeft,
      tooltipTop,
      tooltipData,
      showTooltip,
      hideTooltip,
    } = this.props;

    const margin = {
      top: 15,
      bottom: 40,
      left: 0,
      right: 0,
    };

    const width = parentWidth - margin.left - margin.right;
    const height = parentHeight - margin.top - margin.bottom;

    const bisectDate = bisector(d => x(d)).left;

    const x = d => new Date(d.time);
    const y = d => d.price;
    const firstPoint = data[0];
    const currentPoint = data[data.length - 1];

    const minPrice = Math.min(...data.map(y));
    const maxPrice = Math.max(...data.map(y));
    const maxPriceData = [
      { time: x(firstPoint), price: maxPrice },
      { time: x(currentPoint), price: maxPrice },
    ];
    const minPriceData = [
      { time: x(firstPoint), price: minPrice },
      { time: x(currentPoint), price: minPrice },
    ];
    const xScale = scaleTime({
      range: [0, width],
      domain: [Math.min(...data.map(x)), Math.max(...data.map(x))],
    });

    const yScale = scaleLinear({
      range: [height, 0],
      domain: [minPrice, maxPrice],
    });

    return (
      <div>
        <svg ref={s => (this.svg = s)} width={width} height={parentHeight}>
          <AxisBottom
            top={yScale(minPrice)}
            data={data}
            scale={xScale}
            x={x}
            numTicks={4}
            hideAxisLine
            hideTicks
            tickLabelComponent={<text fill="#ffffff" fontSize={11} />}
          />
          <LinearGradient
            id="area-fill"
            from="#4682b4"
            to="#4682b4"
            fromOpacity={0.3}
            toOpacity={0}
          />
          <MaxPrice
            data={maxPriceData}
            yScale={yScale}
            xScale={xScale}
            x={x}
            y={y}
            label={formatPrice(maxPrice)}
            yText={yScale(maxPrice)}
          />

          <MinPrice
            data={minPriceData}
            yScale={yScale}
            xScale={xScale}
            x={x}
            y={y}
            label={formatPrice(minPrice)}
            yText={yScale(minPrice)}
          />
          <AreaClosed
            data={data}
            yScale={yScale}
            xScale={xScale}
            x={x}
            y={y}
            fill="url(#area-fill)"
            stroke="transparent"
          />
          <LinePath data={data} yScale={yScale} xScale={xScale} x={x} y={y} />
          <Bar
            data={data}
            width={width}
            height={height}
            fill="transparent"
            onMouseLeave={data => event => hideTooltip()}
            onMouseMove={data => (event) => {
              const { x: xPoint } = localPoint(this.svg, event);
              const x0 = xScale.invert(xPoint);
              const index = bisectDate(data, x0, 1);
              const d0 = data[index - 1];
              const d1 = data[index];
              const d = x0 - xScale(x(d0)) > xScale(d(d1)) - x0 ? d1 : d0;
              showTooltip({
                tooltipLeft: xScale(x(d)),
                tooltipTop: yScale(y(d)),
                tooltipData: d,
              });
            }}
          />
          {tooltipData && (
            <g>
              <Line
                from={{
                  x: tooltipLeft,
                  y: yScale(y(maxPriceData[0])),
                }}
                to={{
                  x: tooltipLeft,
                  y: yScale(y(minPriceData[0])),
                }}
                stroke="#ffffff"
                strokeDasharray="2,2"
              />
              <circle
                r="8"
                cx={tooltipLeft}
                cy={tootipTop}
                fill="#00f1a1"
                fillOpacity={0.4}
                style={{ pointerEvents: 'none' }}
              />
              <circle
                r="4"
                cx={tooltipLeft}
                cy={tootipTop}
                fill="#00f1a1"
                style={{ pointerEvents: 'none' }}
              />
            </g>
          )}
        </svg>
        {tooltipData && (
          <div>
            <Tooltip
              top={tooltipTop - 12}
              left={tooltipLeft + 12}
              style={{
                backgroundColor: '#6086d6',
                color: '#ffffff',
              }}
            >
              {formatPrice(y(tooltipData))}
            </Tooltip>
            <Tooltip
              left={tooltipLeft}
              top={yScale(minPrice)}
              style={{
                transform: 'translate(-50%)',
              }}
            >
              {formatDate(x(tooltipData))}
            </Tooltip>
          </div>
        )}
      </div>
    );
  }
}

export default withParentSize(withTooltip(Chart));
