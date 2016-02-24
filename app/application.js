
var Application = (function($) {
  "use strict";

  // initialize privates to suppress errors
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
      cube = {},
      dodec = new THREE.Object3D(),
      dodecInitialized = false,
      isDragging = false,
      mirrorCamera = new THREE.CubeCamera(0.1, 1000, 512),
      renderer = new THREE.WebGLRenderer({ antialias: true }),
      scene = {};


  // helpers
  function toRadians(deg) {
    return deg * (Math.PI/180);
  }


  function setupScene() {
    // gl initialization
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // setup scene
    scene = new THREE.Scene();

    new THREE.TextureLoader().load(

      'IMG_3049.JPG',

      function(bgTexture) {
        bgTexture.wrapS = THREE.RepeatWrapping;
        bgTexture.repeat.x = - 1;

        var bgMaterial = new THREE.MeshBasicMaterial({map: bgTexture});
        var cubeGeom = new THREE.BoxGeometry(25, 16, 16);

        var material = new THREE.MeshBasicMaterial({
          map: bgTexture,
          needsUpdate: true,
          side: THREE.DoubleSide
        });

        cube = new THREE.Mesh(cubeGeom, material);
        scene.add(cube);
      }
    );

    camera.position.z = 1;

    // great dodecahedron
    scene.add(mirrorCamera);

    var objLoader = new THREE.OBJLoader();
    objLoader.load(
    'dodec.obj',
      function(object) {

        var dodecMaterial = new THREE.MeshBasicMaterial(
          {
            envMap: mirrorCamera.renderTarget,
          }
        );

        object.traverse(function(child) {
          if (child instanceof THREE.Mesh) {
            child.material = dodecMaterial;
          }
        });

        object.position.z = -4;
        object.scale.set(0.06, 0.06, 0.06);
        dodec = object;

        scene.add(object);
        dodecInitialized = true;
      }
    );
  }


  function setupInteractivity() {

    // object moves with mouse drags, begins spinning again on mouseup
    isDragging = false;
    var previousMousePosition = {
        x: 0,
        y: 0
    };

    $(renderer.domElement).on('mousedown', function(e) {
        isDragging = true;
    })
    .on('mousemove', function(e) {
        var deltaMove = {
            x: e.offsetX-previousMousePosition.x,
            y: e.offsetY-previousMousePosition.y
        };

        if(isDragging) {

            var deltaRotationQuaternion = new THREE.Quaternion()
                .setFromEuler(new THREE.Euler(
                    toRadians(deltaMove.y * 1),
                    toRadians(deltaMove.x * 1),
                    0,
                    'XYZ'
                ));

            dodec.quaternion.multiplyQuaternions(deltaRotationQuaternion, dodec.quaternion);
        }

        previousMousePosition = {
            x: e.offsetX,
            y: e.offsetY
        };
    });

    $(document).on('mouseup', function(e) {
        isDragging = false;
    });


    // change the image to something the user uploads
    $("#userImage").change(function() {
      var image = document.createElement("img");
      var texture = new THREE.Texture(image);

      image.onload = function(){

        texture.needsUpdate = true;
      };

      var userImage = $("#userImage")[0];
      if (userImage.files && userImage.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
          image.src = e.target.result;
          texture.wrapS = THREE.RepeatWrapping;
          texture.repeat.x = - 1;
          cube.material.map = texture;
        };
        reader.readAsDataURL(userImage.files[0]);
      }
    });
  }


  function render() {
    if (dodecInitialized ) {
      dodec.visible = false;
      mirrorCamera.updateCubeMap(renderer, scene);
      dodec.visible = true;
    }

    requestAnimationFrame(render);

    if (!isDragging) {
      dodec.rotation.x += 0.003;
      dodec.rotation.y += 0.003;
    }
    renderer.render(scene, camera);
  }


  return {
    init: function(){
      setupScene();
      setupInteractivity();
      render();
     }
  };

})(jQuery);



module.exports = Application;
