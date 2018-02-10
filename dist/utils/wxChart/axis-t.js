'use strict';

/**
 * Created by ChenChao on 2017/1/3.
 */

module.exports = function () {
    return {
        name: '',
        col: 5,
        row: 5,
        showEdg: true,
        showX: true,
        showY: true,
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        color: '#2f2f2f',
        txtColor: 'white',
        lineWidth: 1,
        fontSize: 12,
        init: function init(ctx, options) {
            var that = this;
            var w = options.width;
            var h = options.height;
            if (w === 'auto') {
                wx.getSystemInfo({
                    success: function success(result) {
                        w = that.canvasWidth = result.windowWidth;
                    }
                });
            }
            if (h === 'auto') {
                h = 225;
            }
            this.name = options.name;
            this.initConfig(options.axis);
            this.drawX(ctx, w, h, options);
            this.showY && this.drawY(ctx, w, h, options.yAxis);
            return this;
        },
        initConfig: function initConfig(options) {
            this.col = this.name == 'time-sharing-5day' ? 5 : options.col;
            this.row = options.row;
            this.showEdg = options.showEdg || true;
            this.showX = options.showX || true;
            this.showY = options.showY || true;
            this.paddingTop = options.paddingTop || 0;
            this.paddingBottom = options.paddingBottom || 0;
            this.paddingLeft = options.paddingLeft || 0;
            this.paddingRight = options.paddingRight || 0;
            this.color = options.color;
        },
        drawX: function drawX(ctx, w, h, options) {
            var xOpt = options.xAxis;
            var col = this.col;
            var type = xOpt.type;
            var times;
            var pb = this.paddingBottom;
            var startX = this.paddingLeft;
            var endX = w - this.paddingRight;
            var startY = this.paddingTop;
            var endY = h - pb;
            var timeStep = Math.abs(endX - startX) / 5;
            ctx.setFontSize(this.fontSize);
            if (this.showX) {
                this.onePixelLineTo(ctx, startX, startY, startX, endY, false);
                var step = (w - this.paddingLeft - this.paddingRight) / col;
                for (var i = 1; i < col; i++) {
                    var x = startX + step * i;
                    this.onePixelLineTo(ctx, x, startY, x, endY, false);
                }
                this.onePixelLineTo(ctx, endX, startY, endX, endY, false);
            }
            ctx.setFillStyle(this.txtColor);
            if (xOpt.times) {
                if (this.name == 'time-sharing-5day') {
                    times = options.axis.day5;
                    times.forEach(function (day, index) {
                        ctx.fillText(day.split('-').splice(1, 2).join('/'), timeStep / 2 - 12 + timeStep * index, endY + pb - 2);
                    });
                } else {
                    times = xOpt.times;
                    ctx.fillText(times[0], startX + 2, endY + pb - 2);
                    ctx.fillText(times[1], endX - 32, endY + pb - 2);
                }
            }
            if (type === 'category') {}
        },
        drawY: function drawY(ctx, w, h, yOpt) {
            var row = this.row;
            var startX = this.paddingLeft;
            var endX = w - this.paddingRight;
            var startY = this.paddingTop;
            var endY = h - this.paddingBottom;
            var s0 = yOpt[0];
            var base = s0.base || '';
            var maxAbs = s0.maxAbs;
            var max = base + maxAbs;

            var ss = 2 * maxAbs / row;
            var middleIndex = row / 2;
            var pt = this.paddingTop;
            var pb = this.paddingBottom;
            this.drawYUnit = drawYUnit;
            drawYLine.call(this);
            function drawYLine() {
                this.onePixelLineTo(ctx, startX, startY, endX, startY, true);
                var step = (h - pt - pb) / row;
                for (var i = 1; i < row; i++) {
                    var y = startY + step * i;
                    this.onePixelLineTo(ctx, startX, y, endX, y, true);
                }
                this.onePixelLineTo(ctx, startX, endY, endX, endY, true);
            }
            function drawYUnit() {
                var rightTxtX = endX - 40;
                if (base) {
                    ctx.setFillStyle('#ff2f2f');
                    ctx.fillText(max.toFixed(2), startX + 3, startY + 10);
                    ctx.fillText((Math.abs(max - base) * 100 / base).toFixed(2) + '%', rightTxtX, startY + 10);
                }
                var step = (h - pb - pb) / row;
                for (var i = 1; i < row; i++) {
                    var y = startY + step * i;
                    if (base) {
                        var txt = (max - ss * i).toFixed(2);
                        if (i < middleIndex) {
                            ctx.setFillStyle('#ff2f2f');
                            ctx.fillText(txt, startX + 3, y + 10);
                            ctx.fillText((Math.abs(max - ss * i - base) * 100 / base).toFixed(2) + '%', rightTxtX, y + 10);
                        }
                        if (i === middleIndex) {
                            ctx.setFillStyle('white');
                            ctx.fillText(base.toFixed(2), startX + 3, y + 4);
                            ctx.fillText('0.00%', rightTxtX, y + 4);
                        }
                        if (i > middleIndex) {
                            ctx.setFillStyle('#4cd264');
                            ctx.fillText(txt, startX + 3, y - 4);
                            ctx.fillText((Math.abs(base - max + ss * i) * 100 / base).toFixed(2) + '%', rightTxtX, y - 4);
                        }
                    }
                }
                if (base) {
                    ctx.setFillStyle('#4cd264');
                    ctx.fillText((max - ss * i).toFixed(2), startX + 3, startY + step * i - 4);
                    ctx.fillText((Math.abs(base - max + ss * i) * 100 / base).toFixed(2) + '%', rightTxtX, startY + step * i - 4);
                }
            }
        },
        onePixelLineTo: function onePixelLineTo(ctx, fromX, fromY, toX, toY, vertical) {
            var backgroundColor = '#1e1e26';
            var currentStrokeStyle = '#2f2f2f';
            ctx.beginPath();
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(toX, toY);
            ctx.closePath();
            ctx.setLineWidth(2);
            ctx.setStrokeStyle(backgroundColor);
            ctx.stroke();
            ctx.beginPath();
            if (vertical) {
                ctx.moveTo(fromX, fromY);
                ctx.lineTo(toX + 1, toY);
            } else {
                ctx.moveTo(fromX, fromY + 1);
                ctx.lineTo(toX, toY + 1);
            }
            ctx.closePath();
            ctx.setLineWidth(1);
            ctx.setStrokeStyle(currentStrokeStyle);
            ctx.stroke();
        }
    };
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF4aXMtdC5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwibmFtZSIsImNvbCIsInJvdyIsInNob3dFZGciLCJzaG93WCIsInNob3dZIiwicGFkZGluZ1RvcCIsInBhZGRpbmdCb3R0b20iLCJwYWRkaW5nTGVmdCIsInBhZGRpbmdSaWdodCIsImNvbG9yIiwidHh0Q29sb3IiLCJsaW5lV2lkdGgiLCJmb250U2l6ZSIsImluaXQiLCJjdHgiLCJvcHRpb25zIiwidGhhdCIsInciLCJ3aWR0aCIsImgiLCJoZWlnaHQiLCJ3eCIsImdldFN5c3RlbUluZm8iLCJzdWNjZXNzIiwicmVzdWx0IiwiY2FudmFzV2lkdGgiLCJ3aW5kb3dXaWR0aCIsImluaXRDb25maWciLCJheGlzIiwiZHJhd1giLCJkcmF3WSIsInlBeGlzIiwieE9wdCIsInhBeGlzIiwidHlwZSIsInRpbWVzIiwicGIiLCJzdGFydFgiLCJlbmRYIiwic3RhcnRZIiwiZW5kWSIsInRpbWVTdGVwIiwiTWF0aCIsImFicyIsInNldEZvbnRTaXplIiwib25lUGl4ZWxMaW5lVG8iLCJzdGVwIiwiaSIsIngiLCJzZXRGaWxsU3R5bGUiLCJkYXk1IiwiZm9yRWFjaCIsImRheSIsImluZGV4IiwiZmlsbFRleHQiLCJzcGxpdCIsInNwbGljZSIsImpvaW4iLCJ5T3B0IiwiczAiLCJiYXNlIiwibWF4QWJzIiwibWF4Iiwic3MiLCJtaWRkbGVJbmRleCIsInB0IiwiZHJhd1lVbml0IiwiZHJhd1lMaW5lIiwiY2FsbCIsInkiLCJyaWdodFR4dFgiLCJ0b0ZpeGVkIiwidHh0IiwiZnJvbVgiLCJmcm9tWSIsInRvWCIsInRvWSIsInZlcnRpY2FsIiwiYmFja2dyb3VuZENvbG9yIiwiY3VycmVudFN0cm9rZVN0eWxlIiwiYmVnaW5QYXRoIiwibW92ZVRvIiwibGluZVRvIiwiY2xvc2VQYXRoIiwic2V0TGluZVdpZHRoIiwic2V0U3Ryb2tlU3R5bGUiLCJzdHJva2UiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7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LFFBQUgsRUFBYTtBQUNUL0Qsb0JBQUltRSxNQUFKLENBQVdSLEtBQVgsRUFBa0JDLEtBQWxCO0FBQ0E1RCxvQkFBSW9FLE1BQUosQ0FBV1AsTUFBTSxDQUFqQixFQUFvQkMsR0FBcEI7QUFDSCxhQUhELE1BR087QUFDSDlELG9CQUFJbUUsTUFBSixDQUFXUixLQUFYLEVBQWtCQyxRQUFRLENBQTFCO0FBQ0E1RCxvQkFBSW9FLE1BQUosQ0FBV1AsR0FBWCxFQUFnQkMsTUFBTSxDQUF0QjtBQUNIO0FBQ0Q5RCxnQkFBSXFFLFNBQUo7QUFDQXJFLGdCQUFJc0UsWUFBSixDQUFpQixDQUFqQjtBQUNBdEUsZ0JBQUl1RSxjQUFKLENBQW1CTixrQkFBbkI7QUFDQWpFLGdCQUFJd0UsTUFBSjtBQUNIO0FBektFLEtBQVA7QUEyS0gsQ0E1S0QiLCJmaWxlIjoiYXhpcy10LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IENoZW5DaGFvIG9uIDIwMTcvMS8zLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6ICcnLFxuICAgICAgICBjb2w6IDUsXG4gICAgICAgIHJvdzogNSxcbiAgICAgICAgc2hvd0VkZzogdHJ1ZSxcbiAgICAgICAgc2hvd1g6IHRydWUsXG4gICAgICAgIHNob3dZOiB0cnVlLFxuICAgICAgICBwYWRkaW5nVG9wOiAwLFxuICAgICAgICBwYWRkaW5nQm90dG9tOiAwLFxuICAgICAgICBwYWRkaW5nTGVmdDogMCxcbiAgICAgICAgcGFkZGluZ1JpZ2h0OiAwLFxuICAgICAgICBjb2xvcjogJyMyZjJmMmYnLFxuICAgICAgICB0eHRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgbGluZVdpZHRoOiAxLFxuICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uIChjdHgsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHZhciB3ID0gb3B0aW9ucy53aWR0aDtcbiAgICAgICAgICAgIHZhciBoID0gb3B0aW9ucy5oZWlnaHQ7XG4gICAgICAgICAgICBpZih3ID09PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICB3eC5nZXRTeXN0ZW1JbmZvKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdyA9IHRoYXQuY2FudmFzV2lkdGggPSByZXN1bHQud2luZG93V2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGggPT09ICdhdXRvJyl7XG4gICAgICAgICAgICAgICAgaCA9IDIyNTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubmFtZSA9IG9wdGlvbnMubmFtZTtcbiAgICAgICAgICAgIHRoaXMuaW5pdENvbmZpZyhvcHRpb25zLmF4aXMpO1xuICAgICAgICAgICAgdGhpcy5kcmF3WChjdHgsIHcsIGgsIG9wdGlvbnMpO1xuICAgICAgICAgICAgdGhpcy5zaG93WSAmJiB0aGlzLmRyYXdZKGN0eCwgdywgaCwgb3B0aW9ucy55QXhpcyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgaW5pdENvbmZpZzogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHRoaXMuY29sID0gdGhpcy5uYW1lID09ICd0aW1lLXNoYXJpbmctNWRheScgPyA1IDogb3B0aW9ucy5jb2w7XG4gICAgICAgICAgICB0aGlzLnJvdyA9IG9wdGlvbnMucm93O1xuICAgICAgICAgICAgdGhpcy5zaG93RWRnID0gb3B0aW9ucy5zaG93RWRnIHx8IHRydWU7XG4gICAgICAgICAgICB0aGlzLnNob3dYID0gb3B0aW9ucy5zaG93WCB8fCB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zaG93WSA9IG9wdGlvbnMuc2hvd1kgfHwgdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMucGFkZGluZ1RvcCA9IG9wdGlvbnMucGFkZGluZ1RvcCB8fCAwO1xuICAgICAgICAgICAgdGhpcy5wYWRkaW5nQm90dG9tID0gb3B0aW9ucy5wYWRkaW5nQm90dG9tIHx8IDA7XG4gICAgICAgICAgICB0aGlzLnBhZGRpbmdMZWZ0ID0gb3B0aW9ucy5wYWRkaW5nTGVmdCB8fCAwO1xuICAgICAgICAgICAgdGhpcy5wYWRkaW5nUmlnaHQgPSBvcHRpb25zLnBhZGRpbmdSaWdodCB8fCAwO1xuICAgICAgICAgICAgdGhpcy5jb2xvciA9IG9wdGlvbnMuY29sb3I7XG4gICAgICAgIH0sXG4gICAgICAgIGRyYXdYOiBmdW5jdGlvbiAoY3R4LCB3LCBoLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgeE9wdCA9IG9wdGlvbnMueEF4aXM7XG4gICAgICAgICAgICB2YXIgY29sID0gdGhpcy5jb2w7XG4gICAgICAgICAgICB2YXIgdHlwZSA9IHhPcHQudHlwZTtcbiAgICAgICAgICAgIHZhciB0aW1lcztcbiAgICAgICAgICAgIHZhciBwYiA9IHRoaXMucGFkZGluZ0JvdHRvbTtcbiAgICAgICAgICAgIHZhciBzdGFydFggPSB0aGlzLnBhZGRpbmdMZWZ0O1xuICAgICAgICAgICAgdmFyIGVuZFggPSB3IC0gdGhpcy5wYWRkaW5nUmlnaHQ7XG4gICAgICAgICAgICB2YXIgc3RhcnRZID0gdGhpcy5wYWRkaW5nVG9wO1xuICAgICAgICAgICAgdmFyIGVuZFkgPSBoIC0gcGI7XG4gICAgICAgICAgICB2YXIgdGltZVN0ZXAgPSBNYXRoLmFicyhlbmRYIC0gc3RhcnRYKS81O1xuICAgICAgICAgICAgY3R4LnNldEZvbnRTaXplKHRoaXMuZm9udFNpemUpO1xuICAgICAgICAgICAgaWYodGhpcy5zaG93WCkge1xuICAgICAgICAgICAgICAgIHRoaXMub25lUGl4ZWxMaW5lVG8oY3R4LCBzdGFydFgsIHN0YXJ0WSwgc3RhcnRYLCBlbmRZLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgdmFyIHN0ZXAgPSAodyAtIHRoaXMucGFkZGluZ0xlZnQgLSB0aGlzLnBhZGRpbmdSaWdodCkgLyBjb2w7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBjb2w7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgeCA9IHN0YXJ0WCArIHN0ZXAgKiBpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uZVBpeGVsTGluZVRvKGN0eCwgeCwgc3RhcnRZLCB4LCBlbmRZLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMub25lUGl4ZWxMaW5lVG8oY3R4LCBlbmRYLCBzdGFydFksIGVuZFgsIGVuZFksIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN0eC5zZXRGaWxsU3R5bGUodGhpcy50eHRDb2xvcik7XG4gICAgICAgICAgICBpZih4T3B0LnRpbWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubmFtZSA9PSAndGltZS1zaGFyaW5nLTVkYXknKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVzID0gb3B0aW9ucy5heGlzLmRheTU7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVzLmZvckVhY2goZnVuY3Rpb24gKGRheSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dChkYXkuc3BsaXQoJy0nKS5zcGxpY2UoMSwyKS5qb2luKCcvJyksIHRpbWVTdGVwLzIgLSAxMiArIHRpbWVTdGVwICogaW5kZXgsIGVuZFkgKyBwYiAtIDIpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aW1lcyA9IHhPcHQudGltZXM7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dCh0aW1lc1swXSwgc3RhcnRYICsgMiwgZW5kWSArIHBiIC0gMik7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dCh0aW1lc1sxXSwgZW5kWCAtIDMyLCBlbmRZICsgcGIgLSAyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZih0eXBlID09PSAnY2F0ZWdvcnknKXtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkcmF3WTogZnVuY3Rpb24gKGN0eCwgdywgaCwgeU9wdCkge1xuICAgICAgICAgICAgdmFyIHJvdyA9IHRoaXMucm93O1xuICAgICAgICAgICAgdmFyIHN0YXJ0WCA9IHRoaXMucGFkZGluZ0xlZnQ7XG4gICAgICAgICAgICB2YXIgZW5kWCA9IHcgLSB0aGlzLnBhZGRpbmdSaWdodDtcbiAgICAgICAgICAgIHZhciBzdGFydFkgPSB0aGlzLnBhZGRpbmdUb3A7XG4gICAgICAgICAgICB2YXIgZW5kWSA9IGggLSB0aGlzLnBhZGRpbmdCb3R0b207XG4gICAgICAgICAgICB2YXIgczAgPSB5T3B0WzBdO1xuICAgICAgICAgICAgdmFyIGJhc2UgPSBzMC5iYXNlIHx8ICcnO1xuICAgICAgICAgICAgdmFyIG1heEFicyA9IHMwLm1heEFicztcbiAgICAgICAgICAgIHZhciBtYXggPSBiYXNlICsgbWF4QWJzO1xuXG4gICAgICAgICAgICB2YXIgc3MgPSAyICogbWF4QWJzIC8gcm93O1xuICAgICAgICAgICAgdmFyIG1pZGRsZUluZGV4ID0gcm93IC8gMjtcbiAgICAgICAgICAgIHZhciBwdCA9IHRoaXMucGFkZGluZ1RvcDtcbiAgICAgICAgICAgIHZhciBwYiA9IHRoaXMucGFkZGluZ0JvdHRvbTtcbiAgICAgICAgICAgIHRoaXMuZHJhd1lVbml0ID0gZHJhd1lVbml0O1xuICAgICAgICAgICAgZHJhd1lMaW5lLmNhbGwodGhpcyk7XG4gICAgICAgICAgICBmdW5jdGlvbiBkcmF3WUxpbmUoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbmVQaXhlbExpbmVUbyhjdHgsIHN0YXJ0WCwgc3RhcnRZLCBlbmRYLCBzdGFydFksIHRydWUpO1xuICAgICAgICAgICAgICAgIHZhciBzdGVwID0gKGggLSBwdCAtIHBiKSAvIHJvdztcbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgPSAxOyBpIDwgcm93OyBpKyspe1xuICAgICAgICAgICAgICAgICAgICB2YXIgeSA9IHN0YXJ0WSArIHN0ZXAgKiBpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uZVBpeGVsTGluZVRvKGN0eCwgc3RhcnRYLCB5LCBlbmRYLCB5LCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5vbmVQaXhlbExpbmVUbyhjdHgsIHN0YXJ0WCwgZW5kWSwgZW5kWCwgZW5kWSwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBkcmF3WVVuaXQoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJpZ2h0VHh0WCA9IGVuZFggLSA0MDtcbiAgICAgICAgICAgICAgICBpZihiYXNlKXtcbiAgICAgICAgICAgICAgICAgICAgY3R4LnNldEZpbGxTdHlsZSgnI2ZmMmYyZicpO1xuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFRleHQobWF4LnRvRml4ZWQoMiksIHN0YXJ0WCArIDMsIHN0YXJ0WSArIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxUZXh0KChNYXRoLmFicyhtYXggLSBiYXNlKSAqIDEwMCAvIGJhc2UpLnRvRml4ZWQoMikgKyAnJScsIHJpZ2h0VHh0WCwgc3RhcnRZICsgMTApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgc3RlcCA9IChoIC0gcGIgLSBwYikgLyByb3c7XG4gICAgICAgICAgICAgICAgZm9yKHZhciBpID0gMTsgaSA8IHJvdzsgaSsrKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHkgPSBzdGFydFkgKyBzdGVwICogaTtcbiAgICAgICAgICAgICAgICAgICAgaWYoYmFzZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdHh0ID0gKG1heCAtIHNzICogaSkudG9GaXhlZCgyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGkgPCBtaWRkbGVJbmRleCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4LnNldEZpbGxTdHlsZSgnI2ZmMmYyZicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dCh0eHQsIHN0YXJ0WCArIDMsIHkgKyAxMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxUZXh0KChNYXRoLmFicyhtYXggLSBzcyAqIGkgLSBiYXNlKSAqIDEwMCAvIGJhc2UpLnRvRml4ZWQoMikgKyAnJScsIHJpZ2h0VHh0WCwgeSArIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGkgPT09IG1pZGRsZUluZGV4KXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHguc2V0RmlsbFN0eWxlKCd3aGl0ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dChiYXNlLnRvRml4ZWQoMiksIHN0YXJ0WCArIDMsIHkgKyA0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFRleHQoJzAuMDAlJywgcmlnaHRUeHRYLCB5ICsgNCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpID4gbWlkZGxlSW5kZXgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5zZXRGaWxsU3R5bGUoJyM0Y2QyNjQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFRleHQodHh0LCBzdGFydFggKyAzLCB5IC0gNCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxUZXh0KChNYXRoLmFicyhiYXNlIC0gbWF4ICsgc3MgKiBpKSAqIDEwMCAvIGJhc2UpLnRvRml4ZWQoMikgKyAnJScsIHJpZ2h0VHh0WCwgeSAtIDQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKGJhc2Upe1xuICAgICAgICAgICAgICAgICAgICBjdHguc2V0RmlsbFN0eWxlKCcjNGNkMjY0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dCgobWF4IC0gc3MgKiBpKS50b0ZpeGVkKDIpLCBzdGFydFggKyAzLCBzdGFydFkgKyBzdGVwICogaSAtIDQpO1xuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFRleHQoKE1hdGguYWJzKGJhc2UgLSBtYXggKyBzcyAqIGkpICogMTAwIC8gYmFzZSkudG9GaXhlZCgyKSArICclJywgcmlnaHRUeHRYLCBzdGFydFkgKyBzdGVwICogaSAtIDQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgb25lUGl4ZWxMaW5lVG86IGZ1bmN0aW9uIChjdHgsIGZyb21YLCBmcm9tWSwgdG9YLCB0b1ksIHZlcnRpY2FsKSB7XG4gICAgICAgICAgICB2YXIgYmFja2dyb3VuZENvbG9yID0gJyMxZTFlMjYnO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRTdHJva2VTdHlsZSA9ICcjMmYyZjJmJztcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8oZnJvbVgsIGZyb21ZKTtcbiAgICAgICAgICAgIGN0eC5saW5lVG8odG9YLCB0b1kpO1xuICAgICAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgY3R4LnNldExpbmVXaWR0aCgyKTtcbiAgICAgICAgICAgIGN0eC5zZXRTdHJva2VTdHlsZShiYWNrZ3JvdW5kQ29sb3IpO1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgaWYodmVydGljYWwpIHtcbiAgICAgICAgICAgICAgICBjdHgubW92ZVRvKGZyb21YLCBmcm9tWSk7XG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbyh0b1ggKyAxLCB0b1kpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdHgubW92ZVRvKGZyb21YLCBmcm9tWSArIDEpO1xuICAgICAgICAgICAgICAgIGN0eC5saW5lVG8odG9YLCB0b1kgKyAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgIGN0eC5zZXRMaW5lV2lkdGgoMSk7XG4gICAgICAgICAgICBjdHguc2V0U3Ryb2tlU3R5bGUoY3VycmVudFN0cm9rZVN0eWxlKTtcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgfVxuICAgIH07XG59OyJdfQ==