// 导入所有SVG图标
const svgFiles = import.meta.glob('./svg/*.svg', { eager: true });

// 创建SVG符号
const createSvgSymbol = () => {
  const symbols = Object.keys(svgFiles).map((key) => {
    const name = key.replace('./svg/', '').replace('.svg', '');
    const content = (svgFiles[key] as any).default;
    
    // 提取SVG内容
    const svgContent = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i)?.[1] || '';
    
    // 创建symbol元素
    return `
      <symbol id="icon-${name}" viewBox="0 0 1024 1024">
        ${svgContent}
      </symbol>
    `;
  }).join('');
  
  // 创建SVG容器
  const svgContainer = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position: absolute; width: 0; height: 0">
      ${symbols}
    </svg>
  `;
  
  return svgContainer;
};

// 注册SVG图标
export const registerSvgIcons = () => {
  const svgContainer = createSvgSymbol();
  
  // 将SVG容器添加到body
  const div = document.createElement('div');
  div.innerHTML = svgContainer;
  const svg = div.querySelector('svg');
  if (svg) {
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    svg.style.overflow = 'hidden';
    svg.setAttribute('aria-hidden', 'true');
    
    // 确保body已加载
    if (document.body) {
      document.body.insertBefore(svg, document.body.firstChild);
    } else {
      window.addEventListener('DOMContentLoaded', () => {
        document.body.insertBefore(svg, document.body.firstChild);
      });
    }
    
    // 打印注册的图标，便于调试
    console.log('已注册SVG图标:', Object.keys(svgFiles).map(key => key.replace('./svg/', '').replace('.svg', '')));
  } else {
    console.error('SVG图标注册失败');
  }
};

export default registerSvgIcons; 