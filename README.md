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

```javascrt
context.beginPath();
     context.moveTo(0, 0);
     context.lineTo(100, 100);
     context.lineTo(0, 100);
     context.lineTo(0, 0);
context.stroke();
```

* 

## Pixel 가져오기

## HSL로 변환하기

## 선택 영역 제어

## 밝기, 대비 등 기본 보정 적용

## ColorMatrix로 변환


[link_snapseed]:https://itunes.apple.com/kr/app/snapseed/id439438619?mt=8
[link_lightRoom]:https://itunes.apple.com/kr/app/adobe-lightroom-cc/id878783582?mt=8
[link_sample]:https://pages.oss.navercorp.com/kim-jinhoon/selectiveadjust/
