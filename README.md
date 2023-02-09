# miHoYo-Spine

实现米哈游 Spine 动画里的 `extra` 和 `extraConfig` 字段。

**禁止商业使用！~~（米哈游除外~~**

## 食用方法

引入仓库中的 `dist/spine-threejs-mhy-ext.js` 到你的项目中。

使用下面的方式创建 SkeletonMesh。

``` js
// 创建一个 SkeletonMesh 并初始化。
const mesh = new spine.SkeletonMesh(...);

// 各种初始化操作 ...

// 解析 skeleton.json 文件的内容。
// 这里必须自己手动解析，因为 Spine 会把 miHoYo 额外的字段忽略掉！
const jsonData = JSON.parse(...);

// 添加 AutoBone
mesh.autoBone = Object.values(jsonData.extra || {}).map(value => {
  return new AutoBone(value, mesh);
});

// 添加 BoneSpeedConfig
mesh.autoBoneSpeed = new BoneSpeedConfig(jsonData.extraConfig || {});
```

使用下面的代码更新 SkeletonMesh。其中

* `mesh` 是需要更新的 SkeletonMesh。
* `delta` 是上一次更新和这一次更新的间隔时间，单位为秒。
* `accumulatedTime` 是 Spine 动画运行的总时间，单位为秒。

``` js
mesh.state.update(delta);
mesh.state.apply(mesh.skeleton);

let i = 1;
let a = null;
const o = accumulatedTime * mesh.autoBoneSpeed.timeScale * mesh.state.timeScale;

if (mesh.state.tracks.length) {
  i = mesh.state.tracks[0].mixDuration ? Math.min(1, mesh.state.tracks[0].mixTime / mesh.state.tracks[0].mixDuration) : 1;

  if (i < 1 && mesh.state.tracks[0].mixingFrom) {
    a = mesh.state.tracks[0].mixingFrom.animation.name;
  }
}

const s = Math.min(2, Math.abs(o - mesh.prevTime) / .0167);

mesh.prevTime = o;

mesh.autoBone.forEach(bone => bone.render(s, o, i, a));

mesh.skeleton.updateWorldTransform();
mesh.updateGeometry();
```
