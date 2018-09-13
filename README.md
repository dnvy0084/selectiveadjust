# Selective Adjust
[snapseed][link_snapseed], [lightRoom][link_lightRoom]등의 모바일 사진 편집 어플리케이션에서 제공하는 selective adjust 필터를 canvas를 이용해 구현해보며 이미지 필터의 기본 로직과 구현 과정을 알아봅니다. 

[sample page][link_sample]

## 캔버스 생성 및 이미지 그리기

#### Canvas란?
     
HTML5에 추가된 HTML 요소 중 하나입니다. 다양한 그래픽 API를 지원하여 브라우저에서 그림, 사진 등을 그리거나 애니메이션을 만드는데 사용됩니다. Vector Graphic인 \<SVG\> 요소와는 달리 주로 비트맵 그래픽을 그리거나 제어하는데 특화되어 있습니다. 

HTML
```html
<canvas id="view" width="800" height="600"></canvas>
```

JS
```javascript
const canvas = document.querySelector('#view');
const context = canvas.getContext('2d');
```

HTML의 요소로 생성한 canvas의 ```getContext('2d')```를 호출하여 context 객체를 가져옵니다. 이 context 객체에 canvas에서 제공하는 대부분의 그래픽 API가 있습니다.

### 이미지 그리기

canvas는 다양한 그래픽 API를 지원합니다. 그 중에는 moveTo(), lineTo(), stroke()같은 선을 그리는 API도 있고, rect(), arc(), fill() 등 도형을 그리는 API도 있습니다. 하지만 보통의 실무에서는 디자이너가 제작한 리소스를 사용합니다.

HTML
```html
<img id="sample" src="img/sample.jpg">
```

JS
```javascript
const sample = document.querySelector('#sample');

context.drawImage(sample, 0, 0);
```

drawImage를 사용하여 \<img\> 엘리먼트의 이미지를 좌표(0, 0)에 그리는 코드입니다.

## Pixel 가져오기

### ImageData

```javascript
const imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
```

이제 사용자가 선택한 마우스 좌표의 픽셀 정보가 필요합니다. getImageData를 이용하면 현재 canvas에 그려진 픽셀 정보를 가져 올 수 있습니다. ImageData는 이미지를 이루고 있는 각 픽셀의 정보를 배열로 가지고 있는데요, 샘플 이미지는 아래처럼 16만개로 이루어져 있습니다. 

![image data sample][img_imagedata]

800x500 이미지로 픽셀 개수는 40,000개지만 한 픽셀당 Red, Green, Blue, Alpha 4가지 값을 가지고 있어 총 16만개의 숫자들을 가지고 있습니다. RGB는 가장 기본적인 색좌표계로 컴퓨터에서 주로 사용됩니다. 3차원 좌표계에 표시를 하면 아래 그림처럼 정육면체의 모양을 가지고 있습니다. 

![rgb cube][img_rgb_cube]

Red, Green, Blue 각 채널은 스크린을 아래 그림처럼 확대했을 때 보이는 led의 밝기를 뜻합니다.

![screen][img_monitor]

imageData는 pixel 정보를 1차원 배열로 가지고 있어 마우스 좌표 y에 이미지의 가로 길이를 곱하고 x를 더해주면 해당 좌표의 Red 채널 index를 구할 수 있습니다.

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

Selective Adjust는 비슷한 색상의 픽셀만 보정 효과를 적용하는데요, 그러기 위해 마우스 좌표 픽셀의 색상을 알아야 합니다. 색상은 HSB이라는 색좌표계의 H값에 해당하는데요, 포토샵을 사용해본 경험이 있다면 HSB 컬러 피커를 보신적이 있을겁니다. 

![photoshop colorpicker][img_photoshop]

색상(Hue)을 선택 후 채도(Saturation)와 밝기(Brightness)를 조절하여 색을 선택하는 방식입니다. RGB 색 좌표계보다 직관적인 방식이라 포토샵같은 이미지 편집 프로그램에서 많이 사용됩니다. 

![RGB Cube 육각형][img_hexagon]

위에서 본 RGB Cube를, 원점(0, 0, 0)에서 대각선 정점(1, 1, 1)을 이은 일직선 상에서 보면 위 그림처럼 6각형으로 볼 수 있습니다. 상단의 Red를 0도로 120도와 240도에 Green, Blue가 오고 그 사이가 그라데이션으로 채워집니다. 포토샵의 색상바도 빨간색으로 시작해서 빨간색으로 끝나는데요, 6각형에서 확인할 수 있는 것처럼 0도에서 360도의 원형 분포를 가지고 있기 때문입니다. 

![HSB Cylinder][img_hsbcylinder]

그럼 마우스 좌표로 가져온 픽셀(RGB)도 흰색(1, 1, 1) 위치에서 바라보면 일정한 각도를 측정할 수 있고, 샘플 이미지를 이루는 다른 픽셀들도 동일하게 각도를 확인 할 수 있습니다. 이렇게 측정한 각도가 비슷한 픽셀만 정해진 효과를 적용한다면 비슷한 색상만 제어할 수 있게됩니다. 

### 임의의 축에 대한 각도 구하기

현재 마우스 좌표의 z축에 대한 각도는 직각삼각형에서 좌표 x, y의 탄젠트 theta 값과 같으니 탄젠트 역함수를 이용해 아래와 같이 구할 수 있습니다.

![직각삼각형][math_tri]

![각도 구하기][math_getAngle]

다만 우리가 구해야 될 값은 원점(0, 0, 0)에서 정점(1, 1, 1)로 이어지는 가상의 축에 대한 각도입니다. z(0, 0, 1)축에 대한 각도를 구하기 위해 x축(1, 0, 0)에 대한 길이, y축(0, 1, 0)에 대한 길이가 필요했던 것처럼 (1, 1, 1)축에 대한 각도는 (1, 1, -1)축의 길이와 (1, -1, -1)축의 길이로 구할 수 있습니다. 

![1,1,1 축에 대한 각도 구하기][img_axis]

### 벡터와 내적

벡터란 크기와 방향을 가진 어떤 양으로 정의되는 기하학적 단위입니다. (1, 0)은 x축을 나타내기도 하지만 3시 방향으로 1의 크기(혹은 길이)를 가진 어떤 양으로도 바꿔 말할 수 있습니다. 마우스 좌표의 픽셀은 R,G,B라는 3차원 공간에서 어떤 방향과 크기를 나타내고, 위에서 구한 (1, 1, 1), (1, 1, -1), (1, -1, -1)도 모두 벡터라고 말할 수 있습니다. 벡터끼리는 기본적인 4칙연산 이외에도 내적(dot product)이라는 특별한 연산이 있는데요, 다음과 같습니다. 

![벡터 내적][vec_dot_1]

![벡터 내적][vec_dot_2]

두 계산 결과는 동일합니다. 이때 B벡터의 길이를 의도적으로 1로 맞추면 아래처럼 바꿀 수 있는데요, 이 경우 A벡터를 직각삼각형의 빗변이라고 봤을 때 밑변을 구하는 식과 동일해 집니다. 

![직각 삼각형][math_tri]

![벡터 내적][vec_dot_3]

![벡터 내적][vec_dot_4]

이걸 이용해서 마우스 좌표의 픽셀을 (1, 1, -1)축의 길이와 (1, -1, -1)축의 길이로 계산할 수 있습니다. 이런 과정을 임의의 벡터를 축에 투영한다고도 합니다. 

![피타고라스정리][math_pita]

![길이 1인벡터][math_len]

```javascript
function getHueAngle(r, g, b) {
	const len = 0.5773502691896258
		, [ax, ay, az] = [len, len, -len]
		, [bx, by, bz] = [len, -len, -len]
		, x = ax * r + ay * g + az * b
		, y = bx * r + by * g + bz * b;

	return Math.atan2(y, x);
}
```

(r, g, b) 픽셀을 (ax, ay, az)축과 (bx, by, bz)축에 투영하여 나온 (x, y)의 각도를 구하면 픽셀의 hue를 알 수 있습니다. 정확한 hue 각도는 아닐 수 있지만 선택한 픽셀의 색상과 비슷한 색상을 찾아내기 위한 값으로는 이정도면 될 것 같습니다. 

![selection][img_selection]

imageData의 배열을 돌면서 해당 픽셀의 hue 각도를 구해 비슷할 경우 빨간색으로 바꿔줄 수 있습니다. 

## 밝기, 대비 등 보정 적용



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
[img_axis]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/axis.jpg
[img_selection]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/selection.png

[math_tan]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/tan.png
[math_tan-1]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/atan.png
[math_getAngle]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/getAngle.png
[math_tri]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/triangle.jpg
[vec_dot_1]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/vec_dot_1.png
[vec_dot_2]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/vec_dot_2.png
[vec_dot_3]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/vec_dot_3.png
[vec_dot_4]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/vec_dot_5.png
[math_len]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/len.png
[math_pita]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/img/pita.png
