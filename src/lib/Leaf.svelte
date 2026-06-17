<script>
  let { 
    width = 24, 
    height = 24, 
    isTalking = $bindable(false) ,
    color = "#4ade80"
  } = $props();
  
  // Toggle talking state every 2 seconds for demo
  let interval;
  

  function toggleTalking() {
    isTalking = !isTalking;
  }
</script>

<div class="face-container">
  <svg {width} {height} viewBox="0 0 24 24" class="leaf-face">
    <!-- Original leaf shape -->
    <!-- ORIGINAL LEAF COLOR #4ade80 -->
    <path fill={color} d="M11.037 3.048a1.75 1.75 0 0 1 2.2.224l3.712 3.712A6.999 6.999 0 0 1 12.75 18.89v2.359a.75.75 0 1 1-1.5 0V18.89A6.999 6.999 0 0 1 7.051 6.984l3.712-3.712a2 2 0 0 1 .274-.224"/>
    
    <!-- Left eye - long vertical rectangle -->
    <rect 
      x="9" 
      y="8" 
      width="1.5" 
      height="4.5" 
      rx="0.75" 
      fill="white" 
      class="eye"
    />
    
    <!-- Right eye - long vertical rectangle -->
    <rect 
      x="13.5" 
      y="8" 
      width="1.5" 
      height="4.5" 
      rx="0.75" 
      fill="white" 
      class="eye"
    />
    
    <!-- Mouth -->
    {#if isTalking}
      <!-- Talking mouth - small oval -->
      <ellipse 
        cx="12" 
        cy="16" 
        rx="1.2" 
        ry="0.8" 
        fill="white"
        class="mouth talking"
      />
    {:else}
      <!-- Neutral smile -->
      <path 
        d="M 10.5 15.5 Q 12 16.5 13.5 15.5" 
        stroke="white" 
        stroke-width="1.2" 
        fill="none" 
        stroke-linecap="round"
        class="mouth neutral"
      />
    {/if}
  </svg>
</div>

<style>
   .face-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: Arial, sans-serif;
  }
  

  
  .eye {
    transition: all 0.3s ease;
  }
  
  .mouth {
    transition: all 0.3s ease;
  }
  
  .mouth.talking {
    animation: talk 0.5s ease-in-out infinite alternate;
  }
  
  @keyframes talk {
    0% {
      ry: 0.8;
    }
    100% {
      ry: 1.2;
    }
  }
  
  .toggle-btn {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #4ade80;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .toggle-btn:hover {
    background-color: #22c55e;
  }
  
  .status {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }
</style>