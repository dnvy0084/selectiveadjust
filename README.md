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

## HSB로 변환하기

### Hue값 알아오기

* Selective Adjust는 비슷한 색상의 픽셀만 보정 효과를 적용하는데요, 그러기 위해 마우스 좌표 픽셀의 색상을 알아야 합니다. 색상은 HSB이라는 색좌표계의 H값에 해당하는데요, 포토샵을 사용해본 경험이 있다면 HSB 컬러 피커를 보신적이 있을겁니다. 

![photoshop colorpicker][img_photoshop]

색상(Hue)을 선택 후 채도(Saturation)와 밝기(Brightness)를 조절하여 색을 선택하는 방식입니다. RGB 색 좌표계보다 직관적인 방식이라 포토샵같은 이미지 편집 프로그램에서 많이 사용됩니다. 

![RGB Cube 육각형][img_hexagon]

위에서 본 RGB Cube를, 원점(0, 0, 0)에서 대각선 정점(1, 1, 1)을 이은 일직선 상에서 보면 위 그림처럼 6각형으로 볼 수 있습니다. 상단의 Red를 0도로 120도와 240도에 Green, Blue가 오고 그 사이가 그라데이션으로 채워집니다. 포토샵의 색상바도 빨간색으로 시작해서 빨간색으로 끝나는데요, 6각형에서 확인할 수 있는 것처럼 0도에서 360도의 원형 분포를 가지고 있기 때문입니다. 

![HSB Cylinder][img_hsbcylinder]

그럼 마우스 좌표로 가져온 픽셀(RGB)도 흰색(1, 1, 1) 위치에서 바라보면 일정한 각도를 측정할 수 있고, 샘플 이미지를 이루는 다른 픽셀들도 동일하게 각도를 확인 할 수 있습니다. 이렇게 측정한 각도가 비슷한 픽셀만 정해진 효과를 적용한다면 비슷한 색상만 제어할 수 있게됩니다. 

### 임의의 축에 대한 각도 구하기

현재 마우스 좌표의 z축에 대한 각도는 직각삼각형에서 좌표 x, y의 탄젠트 theta 값과 같으니 탄젠트 역함수를 이용해 아래와 같이 구할 수 있습니다.

![각도 구하기][math_getAngle]

다만 우리가 구해야 될 값은 원점(0, 0, 0)에서 정점(1, 1, 1)로 이어지는 가상의 축에 대해 현재 마우스 좌표의 각도입니다. 

## 선택 영역 제어

## 밝기, 대비 등 기본 보정 적용

## ColorMatrix로 변환


[link_snapseed]:https://itunes.apple.com/kr/app/snapseed/id439438619?mt=8
[link_lightRoom]:https://itunes.apple.com/kr/app/adobe-lightroom-cc/id878783582?mt=8
[link_sample]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/

[img_imagedata]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/imagedata_sample.png
[img_rgb_cube]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/rgb_cube.png
[img_monitor]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/monitor_rgb.jpeg
[img_photoshop]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/photoshop.png
[img_hexagon]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/RGB-Cube.PNG
[img_hsbcylinder]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/hsb_cylinder_capture.png

[math_tan]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/tan.png
[math_tan-1]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/atan.png
[math_getAngle]:
