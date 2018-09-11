# Selective Adjust
[snapseed][link_snapseed], [lightRoom][link_lightRoom]등의 모바일 사진 편집 어플리케이션에서 제공하는 selective adjust 필터를 canvas를 이용해 구현해보며 이미지 필터의 기본 로직과 구현 과정을 알아봅니다. 

[sample page][link_sample]

## 캔버스 생성 및 이미지 그리기

#### Canvas란?
     
* HTML5에 추가된 HTML 요소 중 하나입니다. 다양한 그래픽 API를 지원하여 브라우저에서 그림, 사진 등을 그리거나 애니메이션을 만드는데 사용됩니다. Vector Graphic인 \<SVG\> 요소와는 달리 주로 비트맵 그래픽을 그리거나 제어하는데 특화되어 있습니다. 

HTML
```html
<canvas id="view" width="800" height="600"></canvas>
```

JS
```javascript
const canvas = document.querySelector('#view');
const context = canvas.getContext('2d');
```

* HTML의 요소로 생성한 canvas의 ```getContext('2d')```를 호출하여 context 객체를 가져옵니다. 이 context 객체에 canvas에서 제공하는 대부분의 그래픽 API가 있습니다.

### 이미지 그리기

* canvas는 다양한 그래픽 API를 지원합니다. 그 중에는 moveTo(), lineTo(), stroke()같은 선을 그리는 API도 있고, rect(), arc(), fill() 등 도형을 그리는 API도 있습니다. 하지만 보통의 실무에서는 디자이너가 제작한 리소스를 사용합니다.

HTML
```html
<img id="sample" src="img/sample.jpg">
```

JS
```javascript
const sample = document.querySelector('#sample');

context.drawImage(sample, 0, 0);
```

* drawImage를 사용하여 \<img\> 엘리먼트의 이미지를 좌표(0, 0)에 그리는 코드입니다.

## Pixel 가져오기

### ImageData

```javascript
const imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
```

* 이제 사용자가 선택한 마우스 좌표의 픽셀 정보가 필요합니다. getImageData를 이용하면 현재 canvas에 그려진 픽셀 정보를 가져 올 수 있습니다. ImageData는 이미지를 이루고 있는 각 픽셀의 정보를 배열로 가지고 있는데요, 샘플 이미지는 아래처럼 16만개로 이루어져 있습니다. 

![image data sample][img_imagedata]

* 800x500 이미지로 픽셀 개수는 40,000개지만 한 픽셀당 Red, Green, Blue, Alpha 4가지 값을 가지고 있어 총 16만개의 숫자들을 가지고 있습니다. RGB는 가장 기본적인 색좌표계로 컴퓨터에서 주로 사용됩니다. 3차원 좌표계에 표시를 하면 아래 그림처럼 정육면체의 모양을 가지고 있습니다. 

![rgb cube][img_rgb_cube]

* Red, Green, Blue 각 채널은 스크린을 아래 그림처럼 확대했을 때 보이는 led의 밝기를 뜻합니다.

![screen][img_monitor]

* imageData는 pixel 정보를 1차원 배열로 가지고 있어 마우스 좌표 y에 이미지의 가로 길이를 곱하고 x를 더해주면 해당 좌표의 Red 채널 index를 구할 수 있습니다.

```javascript
getPixel(x, y, imgData) {
     const index = 4 * (y * imgData.width + x);
     
     return {
          r: imgData.data[index    ],
          g: imgData.data[index + 1],
          b: imgData.data[index + 2]
     }
}
```

## HSL로 변환하기

* Selective Adjust는 비슷한 색상의 픽셀만 보정 효과를 적용하는데요, 그러기 위해 마우스 좌표 픽셀의 색상을 알아야 합니다. 색상은 HSL이라는 색좌표계의 H값에 해당하는데요, 포토샵을 사용해본 경험이 있다면 HSL 컬러 피커를 보신적이 있을겁니다. 



## 선택 영역 제어

## 밝기, 대비 등 기본 보정 적용

## ColorMatrix로 변환


[link_snapseed]:https://itunes.apple.com/kr/app/snapseed/id439438619?mt=8
[link_lightRoom]:https://itunes.apple.com/kr/app/adobe-lightroom-cc/id878783582?mt=8
[link_sample]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/

[img_imagedata]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/imagedata_sample.png
[img_rgb_cube]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/rgb_cube.png
[img_monitor]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/monitor_rgb.jpeg
