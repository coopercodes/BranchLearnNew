<script>
  let {
    width = 24,
    height = 24,
    color = "#8B5A34",
    spineColor = "#5C3618",
    blockColor = "#F0EBE1"
  } = $props();
</script>

<svg {width} {height} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">

  <!-- Book body -->
  <rect x="4.5" y="2" width="15" height="20" fill={color}/>


  <!-- Centered title block -->
  <rect x="6.5" y="7.5" width="11" height="4" rx="0.5" fill={blockColor}/>

  <!-- Smaller bottom block -->
  <rect x="7.5" y="13" width="9" height="2" rx="0.5" fill={blockColor} opacity="0.75"/>
</svg>