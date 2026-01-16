/* ============================================
   INTERNPATH - Main Application Logic
   ============================================ */

// ============================================
// Skill Weights Per Goal (1-10 importance scale)
// 10 = Critical, 8-9 = Very Important, 6-7 = Important, 4-5 = Helpful, 1-3 = Bonus
// ============================================
const skillWeights = {
  frontend: {
    // Onboarding skills
    html: 7, css: 7, javascript: 10, react: 9, typescript: 7, tailwind: 5, nextjs: 6, testing: 5,
    // Roadmap skills
    html: 7, css: 7, css_responsive: 6, javascript_basics: 10, js_dom: 8, js_async: 9, js_es6: 7, js_modules: 6,
    react_basics: 9, react_hooks: 8, react_state: 7, react_router: 5,
    typescript: 7, testing: 5, performance: 6, nextjs: 6
  },
  backend: {
    programming: 8, nodejs: 9, python: 8, databases: 9, mongodb: 7, rest: 9, auth: 8, docker: 6,
    python_basics: 8, data_structures: 8, algorithms: 7, oop: 7,
    sql_basics: 8, postgresql: 8, mongodb: 7, orm: 5,
    rest_api: 9, nodejs: 9, auth: 8, graphql: 5,
    git_advanced: 6, docker: 6, cicd: 5, cloud: 5
  },
  fullstack: {
    html: 6, javascript: 10, react: 8, nodejs: 9, databases: 9, rest: 8, git: 7, deployment: 5,
    html_css: 6, javascript: 10, react: 8, tailwind: 4,
    nodejs_express: 9, rest_apis: 8, authentication: 7, error_handling: 5,
    sql: 9, nosql: 7, prisma: 5, caching: 4,
    git: 7, vercel: 4, docker_basics: 5, aws: 5
  },
  datascience: {
    python: 10, statistics: 9, pandas: 9, numpy: 8, visualization: 7, sql: 7, ml_basics: 6, bigdata: 4,
    python: 10, numpy: 8, statistics: 9, linear_algebra: 7,
    pandas: 9, visualization: 7, sql_data: 7, eda: 6,
    ml_fundamentals: 7, sklearn: 7, supervised: 6, unsupervised: 5,
    deep_learning: 5, nlp: 4, big_data: 4, deployment: 4
  },
  ml: {
    python: 9, math: 10, statistics: 9, numpy: 8, sklearn: 8, tensorflow: 7, deeplearning: 7, mlops: 5,
    linear_algebra: 10, calculus: 8, probability: 9, python_ml: 8,
    ml_theory: 9, regression: 7, classification: 7, model_eval: 7,
    neural_networks: 8, pytorch: 8, cnn: 6, rnn: 6,
    mlflow: 4, docker_ml: 5, model_serving: 5, ml_pipelines: 5
  },
  devops: {
    linux: 9, scripting: 8, git: 8, docker: 10, cicd: 9, kubernetes: 8, aws: 8, terraform: 7,
    linux: 9, bash: 8, python_devops: 7, networking: 7,
    git_advanced: 8, github_actions: 8, jenkins: 6, gitlab_ci: 5,
    docker: 10, docker_compose: 7, kubernetes: 9, helm: 6,
    aws: 8, terraform: 8, ansible: 6, monitoring: 6
  },
  mobile: {
    programming: 7, javascript: 9, reactnative: 9, flutter: 7, swift: 6, kotlin: 6, apis: 7, appstore: 5,
    javascript: 9, typescript: 7, react: 8, git: 6,
    rn_basics: 9, rn_navigation: 7, rn_state: 8, rn_native: 5,
    ios_basics: 6, android_basics: 6, flutter: 7, expo: 7,
    app_store: 5, play_store: 5, analytics: 4, crash_reporting: 4
  },
  uiux: {
    design_basics: 8, figma: 10, wireframing: 7, prototyping: 8, user_research: 7, design_systems: 6, usability: 6, motion: 5,
    design_principles: 8, color_theory: 6, typography: 7, layout: 7,
    figma: 10, wireframing: 7, prototyping: 8, design_systems: 6,
    user_research: 7, personas: 5, user_journeys: 6, usability: 6,
    motion: 5, accessibility: 7, handoff: 5, portfolio: 4
  }
};

// ============================================
// Skill Prerequisites & Dependencies
// Maps each skill to its prerequisites and minimum level required
// Levels: 'none' (just know it exists), 'beginner', 'intermediate', 'advanced'
// ============================================
const skillPrerequisites = {
  frontend: {
    // Phase 1: Fundamentals
    html: { requires: [], minLevel: 'beginner', category: 'foundation' },
    css: { requires: ['html'], minLevel: 'beginner', category: 'foundation' },
    css_responsive: { requires: ['css'], minLevel: 'intermediate', category: 'foundation' },
    javascript_basics: { requires: ['html', 'css'], minLevel: 'beginner', category: 'foundation' },
    // Phase 2: JS Mastery
    js_dom: { requires: ['javascript_basics'], minLevel: 'intermediate', category: 'javascript' },
    js_async: { requires: ['js_dom'], minLevel: 'intermediate', category: 'javascript' },
    js_es6: { requires: ['javascript_basics'], minLevel: 'intermediate', category: 'javascript' },
    js_modules: { requires: ['js_es6'], minLevel: 'intermediate', category: 'javascript' },
    // Phase 3: React
    react_basics: { requires: ['js_dom', 'js_es6'], minLevel: 'intermediate', category: 'react' },
    react_hooks: { requires: ['react_basics'], minLevel: 'intermediate', category: 'react' },
    react_state: { requires: ['react_hooks'], minLevel: 'advanced', category: 'react' },
    react_router: { requires: ['react_basics'], minLevel: 'intermediate', category: 'react' },
    // Phase 4: Advanced
    typescript: { requires: ['js_es6'], minLevel: 'intermediate', category: 'advanced' },
    testing: { requires: ['react_basics'], minLevel: 'intermediate', category: 'advanced' },
    performance: { requires: ['react_hooks'], minLevel: 'advanced', category: 'advanced' },
    nextjs: { requires: ['react_hooks', 'react_router'], minLevel: 'advanced', category: 'advanced' }
  },

  backend: {
    python_basics: { requires: [], minLevel: 'beginner', category: 'foundation' },
    data_structures: { requires: ['python_basics'], minLevel: 'intermediate', category: 'foundation' },
    algorithms: { requires: ['data_structures'], minLevel: 'intermediate', category: 'foundation' },
    oop: { requires: ['python_basics'], minLevel: 'intermediate', category: 'foundation' },
    sql_basics: { requires: [], minLevel: 'beginner', category: 'database' },
    postgresql: { requires: ['sql_basics'], minLevel: 'intermediate', category: 'database' },
    mongodb: { requires: ['python_basics'], minLevel: 'intermediate', category: 'database' },
    orm: { requires: ['postgresql', 'python_basics'], minLevel: 'intermediate', category: 'database' },
    rest_api: { requires: ['python_basics', 'oop'], minLevel: 'intermediate', category: 'api' },
    nodejs: { requires: ['javascript'], minLevel: 'intermediate', category: 'api' },
    auth: { requires: ['rest_api'], minLevel: 'intermediate', category: 'api' },
    graphql: { requires: ['rest_api'], minLevel: 'advanced', category: 'api' },
    git_advanced: { requires: [], minLevel: 'beginner', category: 'devops' },
    docker: { requires: ['git_advanced'], minLevel: 'intermediate', category: 'devops' },
    cicd: { requires: ['docker', 'git_advanced'], minLevel: 'advanced', category: 'devops' },
    cloud: { requires: ['docker'], minLevel: 'advanced', category: 'devops' }
  },

  fullstack: {
    html_css: { requires: [], minLevel: 'beginner', category: 'frontend' },
    javascript: { requires: ['html_css'], minLevel: 'intermediate', category: 'frontend' },
    react: { requires: ['javascript'], minLevel: 'intermediate', category: 'frontend' },
    tailwind: { requires: ['html_css'], minLevel: 'beginner', category: 'frontend' },
    nodejs_express: { requires: ['javascript'], minLevel: 'intermediate', category: 'backend' },
    rest_apis: { requires: ['nodejs_express'], minLevel: 'intermediate', category: 'backend' },
    authentication: { requires: ['rest_apis'], minLevel: 'intermediate', category: 'backend' },
    error_handling: { requires: ['nodejs_express'], minLevel: 'intermediate', category: 'backend' },
    sql: { requires: [], minLevel: 'beginner', category: 'database' },
    nosql: { requires: ['nodejs_express'], minLevel: 'intermediate', category: 'database' },
    prisma: { requires: ['sql', 'nodejs_express'], minLevel: 'intermediate', category: 'database' },
    caching: { requires: ['nosql'], minLevel: 'advanced', category: 'database' },
    git: { requires: [], minLevel: 'beginner', category: 'deployment' },
    vercel: { requires: ['react', 'git'], minLevel: 'intermediate', category: 'deployment' },
    docker_basics: { requires: ['git'], minLevel: 'intermediate', category: 'deployment' },
    aws: { requires: ['docker_basics'], minLevel: 'advanced', category: 'deployment' }
  },

  datascience: {
    python: { requires: [], minLevel: 'beginner', category: 'foundation' },
    numpy: { requires: ['python'], minLevel: 'intermediate', category: 'foundation' },
    statistics: { requires: ['python'], minLevel: 'intermediate', category: 'foundation' },
    linear_algebra: { requires: ['python', 'numpy'], minLevel: 'intermediate', category: 'foundation' },
    pandas: { requires: ['numpy'], minLevel: 'intermediate', category: 'analysis' },
    visualization: { requires: ['pandas'], minLevel: 'intermediate', category: 'analysis' },
    sql_data: { requires: [], minLevel: 'beginner', category: 'analysis' },
    eda: { requires: ['pandas', 'visualization'], minLevel: 'intermediate', category: 'analysis' },
    ml_fundamentals: { requires: ['statistics', 'linear_algebra'], minLevel: 'intermediate', category: 'ml' },
    sklearn: { requires: ['ml_fundamentals', 'pandas'], minLevel: 'intermediate', category: 'ml' },
    supervised: { requires: ['sklearn'], minLevel: 'advanced', category: 'ml' },
    unsupervised: { requires: ['sklearn'], minLevel: 'advanced', category: 'ml' },
    deep_learning: { requires: ['supervised'], minLevel: 'advanced', category: 'advanced' },
    nlp: { requires: ['deep_learning'], minLevel: 'advanced', category: 'advanced' },
    big_data: { requires: ['pandas', 'sql_data'], minLevel: 'advanced', category: 'advanced' },
    deployment: { requires: ['sklearn'], minLevel: 'advanced', category: 'advanced' }
  },

  ml: {
    python_ml: { requires: [], minLevel: 'intermediate', category: 'foundation' },
    linear_algebra: { requires: ['python_ml'], minLevel: 'intermediate', category: 'math' },
    calculus: { requires: ['python_ml'], minLevel: 'intermediate', category: 'math' },
    probability: { requires: ['python_ml'], minLevel: 'intermediate', category: 'math' },
    ml_theory: { requires: ['linear_algebra', 'probability', 'calculus'], minLevel: 'intermediate', category: 'classical_ml' },
    regression: { requires: ['ml_theory'], minLevel: 'intermediate', category: 'classical_ml' },
    classification: { requires: ['ml_theory'], minLevel: 'intermediate', category: 'classical_ml' },
    model_eval: { requires: ['regression', 'classification'], minLevel: 'intermediate', category: 'classical_ml' },
    neural_networks: { requires: ['model_eval', 'calculus'], minLevel: 'advanced', category: 'deep_learning' },
    pytorch: { requires: ['neural_networks'], minLevel: 'advanced', category: 'deep_learning' },
    cnn: { requires: ['pytorch'], minLevel: 'advanced', category: 'deep_learning' },
    rnn: { requires: ['pytorch'], minLevel: 'advanced', category: 'deep_learning' },
    mlflow: { requires: ['sklearn'], minLevel: 'intermediate', category: 'mlops' },
    docker_ml: { requires: ['mlflow'], minLevel: 'intermediate', category: 'mlops' },
    model_serving: { requires: ['docker_ml'], minLevel: 'advanced', category: 'mlops' },
    ml_pipelines: { requires: ['model_serving'], minLevel: 'advanced', category: 'mlops' }
  },

  devops: {
    linux: { requires: [], minLevel: 'beginner', category: 'foundation' },
    bash: { requires: ['linux'], minLevel: 'intermediate', category: 'foundation' },
    python_devops: { requires: ['linux'], minLevel: 'intermediate', category: 'foundation' },
    networking: { requires: ['linux'], minLevel: 'intermediate', category: 'foundation' },
    git_advanced: { requires: [], minLevel: 'beginner', category: 'vcs' },
    github_actions: { requires: ['git_advanced'], minLevel: 'intermediate', category: 'vcs' },
    jenkins: { requires: ['github_actions'], minLevel: 'intermediate', category: 'vcs' },
    gitlab_ci: { requires: ['git_advanced'], minLevel: 'intermediate', category: 'vcs' },
    docker: { requires: ['linux', 'bash'], minLevel: 'intermediate', category: 'containers' },
    docker_compose: { requires: ['docker'], minLevel: 'intermediate', category: 'containers' },
    kubernetes: { requires: ['docker_compose'], minLevel: 'advanced', category: 'containers' },
    helm: { requires: ['kubernetes'], minLevel: 'advanced', category: 'containers' },
    aws: { requires: ['linux', 'networking'], minLevel: 'intermediate', category: 'cloud' },
    terraform: { requires: ['aws'], minLevel: 'advanced', category: 'cloud' },
    ansible: { requires: ['linux', 'python_devops'], minLevel: 'intermediate', category: 'cloud' },
    monitoring: { requires: ['kubernetes', 'aws'], minLevel: 'advanced', category: 'cloud' }
  },

  mobile: {
    javascript: { requires: [], minLevel: 'intermediate', category: 'foundation' },
    typescript: { requires: ['javascript'], minLevel: 'intermediate', category: 'foundation' },
    react: { requires: ['javascript'], minLevel: 'intermediate', category: 'foundation' },
    git: { requires: [], minLevel: 'beginner', category: 'foundation' },
    rn_basics: { requires: ['react', 'javascript'], minLevel: 'intermediate', category: 'react_native' },
    rn_navigation: { requires: ['rn_basics'], minLevel: 'intermediate', category: 'react_native' },
    rn_state: { requires: ['rn_navigation'], minLevel: 'intermediate', category: 'react_native' },
    rn_native: { requires: ['rn_state'], minLevel: 'advanced', category: 'react_native' },
    ios_basics: { requires: ['rn_basics'], minLevel: 'intermediate', category: 'platform' },
    android_basics: { requires: ['rn_basics'], minLevel: 'intermediate', category: 'platform' },
    flutter: { requires: ['javascript'], minLevel: 'intermediate', category: 'platform' },
    expo: { requires: ['rn_basics'], minLevel: 'intermediate', category: 'platform' },
    app_store: { requires: ['rn_state'], minLevel: 'intermediate', category: 'publishing' },
    play_store: { requires: ['rn_state'], minLevel: 'intermediate', category: 'publishing' },
    analytics: { requires: ['app_store'], minLevel: 'intermediate', category: 'publishing' },
    crash_reporting: { requires: ['app_store'], minLevel: 'intermediate', category: 'publishing' }
  },

  uiux: {
    design_principles: { requires: [], minLevel: 'beginner', category: 'foundation' },
    color_theory: { requires: ['design_principles'], minLevel: 'beginner', category: 'foundation' },
    typography: { requires: ['design_principles'], minLevel: 'beginner', category: 'foundation' },
    layout: { requires: ['design_principles'], minLevel: 'intermediate', category: 'foundation' },
    figma: { requires: ['layout'], minLevel: 'intermediate', category: 'tools' },
    wireframing: { requires: ['figma'], minLevel: 'intermediate', category: 'tools' },
    prototyping: { requires: ['wireframing'], minLevel: 'intermediate', category: 'tools' },
    design_systems: { requires: ['prototyping'], minLevel: 'advanced', category: 'tools' },
    user_research: { requires: ['design_principles'], minLevel: 'intermediate', category: 'research' },
    personas: { requires: ['user_research'], minLevel: 'intermediate', category: 'research' },
    user_journeys: { requires: ['personas'], minLevel: 'intermediate', category: 'research' },
    usability: { requires: ['prototyping', 'user_journeys'], minLevel: 'advanced', category: 'research' },
    motion: { requires: ['prototyping'], minLevel: 'advanced', category: 'advanced' },
    accessibility: { requires: ['figma'], minLevel: 'intermediate', category: 'advanced' },
    handoff: { requires: ['design_systems'], minLevel: 'intermediate', category: 'advanced' },
    portfolio: { requires: ['prototyping'], minLevel: 'advanced', category: 'advanced' }
  }
};

// Skill name mappings for display
const skillNames = {
  // Frontend
  html: 'HTML5 Fundamentals', css: 'CSS3 & Flexbox/Grid', css_responsive: 'Responsive Design',
  javascript_basics: 'JavaScript Basics', js_dom: 'DOM Manipulation', js_async: 'Async JavaScript',
  js_es6: 'ES6+ Features', js_modules: 'Modules & Bundlers', react_basics: 'React Fundamentals',
  react_hooks: 'React Hooks', react_state: 'State Management', react_router: 'React Router',
  typescript: 'TypeScript', testing: 'Testing', performance: 'Performance Optimization', nextjs: 'Next.js',
  // Backend & Full Stack
  python_basics: 'Python Fundamentals', data_structures: 'Data Structures', algorithms: 'Algorithms',
  oop: 'Object-Oriented Programming', sql_basics: 'SQL Fundamentals', postgresql: 'PostgreSQL',
  mongodb: 'MongoDB', orm: 'ORM (Prisma/SQLAlchemy)', rest_api: 'REST API Design',
  nodejs: 'Node.js & Express', auth: 'Authentication (JWT, OAuth)', graphql: 'GraphQL',
  git_advanced: 'Git & Version Control', docker: 'Docker Containers', cicd: 'CI/CD Pipelines',
  cloud: 'Cloud Deployment', html_css: 'HTML5 & CSS3', javascript: 'JavaScript Essentials',
  react: 'React.js', tailwind: 'Tailwind CSS', nodejs_express: 'Node.js & Express',
  rest_apis: 'RESTful APIs', authentication: 'User Authentication', error_handling: 'Error Handling',
  sql: 'SQL Databases', nosql: 'NoSQL (MongoDB)', prisma: 'Prisma ORM', caching: 'Caching (Redis)',
  git: 'Git & GitHub', vercel: 'Vercel/Netlify Deployment', docker_basics: 'Docker Basics', aws: 'AWS Essentials',
  // Data Science & ML
  python: 'Python Programming', numpy: 'NumPy', statistics: 'Statistics Fundamentals',
  linear_algebra: 'Linear Algebra', pandas: 'Pandas for Data Analysis', visualization: 'Data Visualization',
  sql_data: 'SQL for Data Science', eda: 'Exploratory Data Analysis', ml_fundamentals: 'ML Fundamentals',
  sklearn: 'Scikit-learn', supervised: 'Supervised Learning', unsupervised: 'Unsupervised Learning',
  deep_learning: 'Deep Learning', nlp: 'Natural Language Processing', big_data: 'Big Data Tools',
  deployment: 'Model Deployment', python_ml: 'Python for ML', calculus: 'Calculus for ML',
  probability: 'Probability & Statistics', ml_theory: 'ML Theory & Concepts', regression: 'Regression Models',
  classification: 'Classification Models', model_eval: 'Model Evaluation', neural_networks: 'Neural Networks',
  pytorch: 'PyTorch', cnn: 'CNNs for Computer Vision', rnn: 'RNNs & Transformers',
  mlflow: 'Experiment Tracking (MLflow)', docker_ml: 'Docker for ML', model_serving: 'Model Serving',
  ml_pipelines: 'ML Pipelines',
  // DevOps
  linux: 'Linux Fundamentals', bash: 'Bash Scripting', python_devops: 'Python for DevOps',
  networking: 'Networking Basics', github_actions: 'GitHub Actions', jenkins: 'Jenkins',
  gitlab_ci: 'GitLab CI', docker_compose: 'Docker Compose', kubernetes: 'Kubernetes',
  helm: 'Helm Charts', terraform: 'Terraform', ansible: 'Ansible', monitoring: 'Monitoring (Prometheus, Grafana)',
  // Mobile
  rn_basics: 'React Native Basics', rn_navigation: 'Navigation', rn_state: 'State Management',
  rn_native: 'Native Modules', ios_basics: 'iOS Development', android_basics: 'Android Development',
  flutter: 'Flutter', expo: 'Expo Framework', app_store: 'App Store Submission',
  play_store: 'Play Store Submission', analytics: 'App Analytics', crash_reporting: 'Crash Reporting',
  // UI/UX
  design_principles: 'Design Principles', color_theory: 'Color Theory', typography: 'Typography',
  layout: 'Layout & Composition', figma: 'Figma Mastery', wireframing: 'Wireframing',
  prototyping: 'Interactive Prototyping', design_systems: 'Design Systems', user_research: 'User Research Methods',
  personas: 'User Personas', user_journeys: 'User Journey Mapping', usability: 'Usability Testing',
  motion: 'Motion Design', accessibility: 'Accessibility (a11y)', handoff: 'Developer Handoff', portfolio: 'Portfolio Building'
};

// ============================================
// Skill ID Aliases (maps onboarding IDs to roadmap IDs)
// This ensures skills selected in onboarding map to the correct roadmap skills
// ============================================
const skillAliases = {
  ml: {
    python: ['python_ml'],           // Onboarding 'python' maps to roadmap 'python_ml'
    math: ['linear_algebra'],        // Onboarding 'math' (Linear Algebra) maps to 'linear_algebra' only
    statistics: ['probability'],      // Statistics maps to probability
    numpy: ['numpy'],                 // Same ID
    sklearn: ['sklearn'],             // Same ID
    tensorflow: ['pytorch'],          // TensorFlow maps to pytorch
    deeplearning: ['neural_networks'], // Deep Learning maps to neural_networks only
    mlops: ['mlflow']                  // MLOps maps to mlflow only
  },
  datascience: {
    python: ['python'],
    statistics: ['statistics'],
    pandas: ['pandas'],
    numpy: ['numpy'],
    visualization: ['visualization'],
    sql: ['sql_data'],
    ml_basics: ['ml_fundamentals', 'sklearn'],
    bigdata: ['big_data']
  },
  frontend: {
    html: ['html'],
    css: ['css', 'css_responsive'],
    javascript: ['javascript_basics', 'js_dom', 'js_async', 'js_es6', 'js_modules'],
    react: ['react_basics', 'react_hooks', 'react_state', 'react_router'],
    typescript: ['typescript'],
    tailwind: ['tailwind'],
    nextjs: ['nextjs'],
    testing: ['testing']
  },
  backend: {
    programming: ['python_basics', 'data_structures', 'algorithms', 'oop'],
    nodejs: ['nodejs'],
    python: ['python_basics'],
    databases: ['sql_basics', 'postgresql', 'mongodb'],
    mongodb: ['mongodb'],
    rest: ['rest_api'],
    auth: ['auth'],
    docker: ['docker', 'cicd', 'cloud']
  },
  fullstack: {
    html: ['html_css'],
    javascript: ['javascript'],
    react: ['react'],
    nodejs: ['nodejs_express'],
    databases: ['sql', 'nosql', 'prisma'],
    rest: ['rest_apis', 'authentication'],
    git: ['git'],
    deployment: ['vercel', 'docker_basics', 'aws']
  },
  devops: {
    linux: ['linux'],
    scripting: ['bash', 'python_devops'],
    git: ['git_advanced', 'github_actions'],
    docker: ['docker', 'docker_compose'],
    cicd: ['github_actions', 'jenkins', 'gitlab_ci'],
    kubernetes: ['kubernetes', 'helm'],
    aws: ['aws', 'terraform'],
    terraform: ['terraform', 'ansible']
  },
  mobile: {
    programming: ['javascript', 'typescript'],
    javascript: ['javascript'],
    reactnative: ['rn_basics', 'rn_navigation', 'rn_state'],
    flutter: ['flutter'],
    swift: ['ios_basics'],
    kotlin: ['android_basics'],
    apis: ['rest_apis'],
    appstore: ['app_store', 'play_store']
  },
  uiux: {
    design_basics: ['design_principles', 'color_theory', 'typography', 'layout'],
    figma: ['figma'],
    wireframing: ['wireframing'],
    prototyping: ['prototyping'],
    user_research: ['user_research', 'personas', 'user_journeys'],
    design_systems: ['design_systems'],
    usability: ['usability'],
    motion: ['motion']
  }
};

// ============================================
// Dynamic Roadmap Generation
// ============================================
function generateDynamicRoadmap(goal, userSkills) {
  const prereqs = skillPrerequisites[goal];
  if (!prereqs) return null;

  const weights = skillWeights[goal] || {};
  const levelValues = { none: 0, beginner: 0.3, intermediate: 0.6, advanced: 1.0 };
  const levelOrder = ['none', 'beginner', 'intermediate', 'advanced'];

  // Get aliases for this goal
  const aliases = skillAliases[goal] || {};

  // Create reverse mapping: roadmap skill ID -> user skill level
  const mappedUserSkills = {};
  Object.keys(userSkills).forEach(onboardingId => {
    const userLevel = userSkills[onboardingId];
    // Map this onboarding skill to all its roadmap aliases
    const roadmapIds = aliases[onboardingId] || [onboardingId];
    roadmapIds.forEach(roadmapId => {
      // Keep the higher level if already mapped
      const existingLevel = mappedUserSkills[roadmapId];
      if (!existingLevel || levelValues[userLevel] > levelValues[existingLevel]) {
        mappedUserSkills[roadmapId] = userLevel;
      }
    });
  });

  // Analyze each skill
  const skillAnalysis = {};

  Object.keys(prereqs).forEach(skillId => {
    const skillConfig = prereqs[skillId];
    const userLevel = mappedUserSkills[skillId] || 'none';  // Use mapped skills
    const requiredLevel = skillConfig.minLevel;

    const userLevelValue = levelValues[userLevel];
    const requiredLevelValue = levelValues[requiredLevel];

    let status;
    if (userLevelValue >= requiredLevelValue) {
      status = 'known'; // User already knows this at required level
    } else if (userLevelValue > 0) {
      status = 'upgrade'; // User knows basics, needs to upgrade
    } else {
      status = 'new'; // User doesn't know this
    }

    // Check if prerequisites are met
    const prereqsMet = skillConfig.requires.every(req => {
      const reqLevel = userSkills[req] || 'none';
      const reqConfig = prereqs[req];
      if (!reqConfig) return true;
      return levelValues[reqLevel] >= levelValues[reqConfig.minLevel];
    });

    skillAnalysis[skillId] = {
      id: skillId,
      name: skillNames[skillId] || skillId,
      category: skillConfig.category,
      status,
      userLevel,
      requiredLevel,
      prereqsMet,
      requires: skillConfig.requires,
      weight: weights[skillId] || 5
    };
  });

  // Build phases based on categories and dependencies
  const phases = buildDynamicPhases(skillAnalysis, goal);

  return {
    title: roadmapTemplates[goal]?.title || 'Your Roadmap',
    phases,
    analysis: skillAnalysis
  };
}

function buildDynamicPhases(skillAnalysis, goal) {
  // Group skills by category
  const categories = {};
  Object.values(skillAnalysis).forEach(skill => {
    if (!categories[skill.category]) {
      categories[skill.category] = [];
    }
    categories[skill.category].push(skill);
  });

  // Category order per goal
  const categoryOrder = {
    frontend: ['foundation', 'javascript', 'react', 'advanced'],
    backend: ['foundation', 'database', 'api', 'devops'],
    fullstack: ['frontend', 'backend', 'database', 'deployment'],
    datascience: ['foundation', 'analysis', 'ml', 'advanced'],
    ml: ['foundation', 'math', 'classical_ml', 'deep_learning', 'mlops'],
    devops: ['foundation', 'vcs', 'containers', 'cloud'],
    mobile: ['foundation', 'react_native', 'platform', 'publishing'],
    uiux: ['foundation', 'tools', 'research', 'advanced']
  };

  const phaseNames = {
    foundation: 'Foundations',
    javascript: 'JavaScript Mastery',
    react: 'React Ecosystem',
    advanced: 'Advanced Topics',
    database: 'Databases',
    api: 'API Development',
    devops: 'DevOps Basics',
    frontend: 'Frontend Basics',
    backend: 'Backend Basics',
    deployment: 'Deployment & DevOps',
    analysis: 'Data Analysis',
    ml: 'Machine Learning',
    math: 'Math Prerequisites',
    classical_ml: 'Classical ML',
    deep_learning: 'Deep Learning',
    mlops: 'MLOps',
    vcs: 'Version Control & CI/CD',
    containers: 'Containers & Orchestration',
    cloud: 'Cloud & Infrastructure',
    react_native: 'React Native',
    platform: 'Platform Specific',
    publishing: 'Publishing',
    tools: 'Tools & Prototyping',
    research: 'UX Research'
  };

  const phaseIcons = {
    foundation: '📚', javascript: '⚡', react: '⚛️', advanced: '🚀',
    database: '🗃️', api: '🔌', devops: '🛠️', frontend: '🎨',
    backend: '⚙️', deployment: '🚀', analysis: '📊', ml: '🤖',
    math: '📐', classical_ml: '📈', deep_learning: '🧠', mlops: '🔧',
    vcs: '🔄', containers: '🐳', cloud: '☁️', react_native: '📱',
    platform: '🍎', publishing: '🚀', tools: '🛠️', research: '🔍'
  };

  const order = categoryOrder[goal] || Object.keys(categories);
  const phases = [];

  order.forEach((cat, index) => {
    const skills = categories[cat];
    if (!skills || skills.length === 0) return;

    // Sort skills: new first, then upgrade, then known
    // Also sort by weight (higher weight first within each status)
    skills.sort((a, b) => {
      const statusOrder = { new: 0, upgrade: 1, known: 2 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return b.weight - a.weight;
    });

    phases.push({
      name: `Phase ${index + 1}: ${phaseNames[cat] || cat}`,
      icon: phaseIcons[cat] || '📖',
      category: cat,
      skills: skills.map(s => {
        // Calculate realistic hours based on difficulty
        const difficultyMultiplier = s.requiredLevel === 'advanced' ? 1.5 : (s.requiredLevel === 'intermediate' ? 1.2 : 1.0);
        const baseHours = Math.ceil(s.weight * 2.0); // More realistic: 2 hours per weight point
        const adjustedHours = Math.ceil(baseHours * difficultyMultiplier);

        return {
          id: s.id,
          name: s.name,
          status: s.status,
          userLevel: s.userLevel,
          requiredLevel: s.requiredLevel,
          weight: s.weight,
          difficulty: s.requiredLevel === 'advanced' ? 'hard' : (s.requiredLevel === 'intermediate' ? 'medium' : 'easy'),
          duration: `${adjustedHours} hours`,
          resources: Math.min(5, Math.ceil(s.weight * 0.4)),
          core: s.weight >= 7
        };
      })
    });
  });

  return phases;
}

// ============================================
// Roadmap Scheduling System
// ============================================
function calculateRoadmapSchedule(goal, weeklyHours = 10) {
  const userData = getUserData();
  const progress = getProgress();
  const userSkills = userData?.currentSkills || {};

  // Get dynamic roadmap
  const dynamicRoadmap = generateDynamicRoadmap(goal, userSkills);
  if (!dynamicRoadmap) return null;

  // Collect all uncompleted skills with their hours
  const uncompletedSkills = [];

  dynamicRoadmap.phases.forEach(phase => {
    phase.skills.forEach(skill => {
      // Skip if already completed or known
      if (progress.completedSkills.includes(skill.id) || skill.status === 'known') {
        return;
      }

      // Parse hours from duration string (e.g., "4 hours" -> 4)
      const hours = parseInt(skill.duration) || 3;

      uncompletedSkills.push({
        ...skill,
        phase: phase.name,
        phaseIcon: phase.icon,
        estimatedHours: hours
      });
    });
  });

  // Calculate total hours and weeks needed
  const totalHours = uncompletedSkills.reduce((sum, s) => sum + s.estimatedHours, 0);
  // More realistic: allow up to 24 weeks for comprehensive paths
  const estimatedWeeks = Math.max(4, Math.min(24, Math.ceil(totalHours / weeklyHours)));

  // Distribute skills across weeks
  const schedule = {
    startDate: getLocalDateKey(),
    weeklyHours,
    estimatedWeeks,
    totalHours,
    totalSkills: uncompletedSkills.length,
    weeks: []
  };

  let currentWeekHours = 0;
  let currentWeek = 0;

  uncompletedSkills.forEach(skill => {
    if (!schedule.weeks[currentWeek]) {
      schedule.weeks[currentWeek] = {
        weekNumber: currentWeek + 1,
        skills: [],
        totalHours: 0
      };
    }

    // Add skill to current week
    schedule.weeks[currentWeek].skills.push(skill);
    schedule.weeks[currentWeek].totalHours += skill.estimatedHours;
    currentWeekHours += skill.estimatedHours;

    // Move to next week if we've exceeded weekly hours
    if (currentWeekHours >= weeklyHours) {
      currentWeek++;
      currentWeekHours = 0;
    }
  });

  // Save schedule
  localStorage.setItem('internpath_schedule', JSON.stringify(schedule));

  return schedule;
}

function getRoadmapSchedule() {
  const stored = localStorage.getItem('internpath_schedule');
  if (stored) {
    return JSON.parse(stored);
  }

  // Generate new schedule if not exists
  const userData = getUserData();
  if (userData?.goal) {
    return calculateRoadmapSchedule(userData.goal);
  }
  return null;
}

function getScheduledTasksForDate(date = new Date()) {
  const schedule = getRoadmapSchedule();
  if (!schedule) return [];

  const dateKey = getLocalDateKey(date);
  const startDate = new Date(schedule.startDate);
  const targetDate = new Date(dateKey);

  // Calculate which week this date falls into
  const daysDiff = Math.floor((targetDate - startDate) / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(daysDiff / 7);

  if (weekIndex < 0 || weekIndex >= schedule.weeks.length) {
    return [];
  }

  return schedule.weeks[weekIndex]?.skills || [];
}

function getCurrentWeekNumber() {
  const schedule = getRoadmapSchedule();
  if (!schedule) return 1;

  const startDate = new Date(schedule.startDate);
  const today = new Date();
  const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(schedule.weeks.length, Math.floor(daysDiff / 7) + 1));
}

// ============================================
// Roadmap Templates
const roadmapTemplates = {
  frontend: {
    title: 'Frontend Developer',
    phases: [
      {
        name: 'Phase 1: Web Fundamentals',
        icon: '📄',
        skills: [
          { id: 'html', name: 'HTML5 Fundamentals', difficulty: 'easy', duration: '2 hours', resources: 3, core: true },
          { id: 'css', name: 'CSS3 & Flexbox/Grid', difficulty: 'easy', duration: '4 hours', resources: 4, core: true },
          { id: 'css_responsive', name: 'Responsive Design', difficulty: 'medium', duration: '3 hours', resources: 2, core: true },
          { id: 'javascript_basics', name: 'JavaScript Basics', difficulty: 'medium', duration: '6 hours', resources: 5, core: true }
        ]
      },
      {
        name: 'Phase 2: JavaScript Mastery',
        icon: '⚡',
        skills: [
          { id: 'js_dom', name: 'DOM Manipulation', difficulty: 'medium', duration: '3 hours', resources: 3, core: true },
          { id: 'js_async', name: 'Async JavaScript (Promises, Async/Await)', difficulty: 'hard', duration: '4 hours', resources: 4, core: true },
          { id: 'js_es6', name: 'ES6+ Features', difficulty: 'medium', duration: '3 hours', resources: 3, core: false },
          { id: 'js_modules', name: 'Modules & Bundlers', difficulty: 'medium', duration: '2 hours', resources: 2, core: false }
        ]
      },
      {
        name: 'Phase 3: React Ecosystem',
        icon: '⚛️',
        skills: [
          { id: 'react_basics', name: 'React Fundamentals', difficulty: 'medium', duration: '5 hours', resources: 4, core: true },
          { id: 'react_hooks', name: 'React Hooks', difficulty: 'medium', duration: '4 hours', resources: 3, core: true },
          { id: 'react_state', name: 'State Management (Redux/Context)', difficulty: 'hard', duration: '4 hours', resources: 3, core: false },
          { id: 'react_router', name: 'React Router', difficulty: 'easy', duration: '2 hours', resources: 2, core: false }
        ]
      },
      {
        name: 'Phase 4: Advanced & Tools',
        icon: '🛠️',
        skills: [
          { id: 'typescript', name: 'TypeScript', difficulty: 'hard', duration: '6 hours', resources: 4, core: false },
          { id: 'testing', name: 'Testing (Jest, React Testing Library)', difficulty: 'hard', duration: '4 hours', resources: 3, core: false },
          { id: 'performance', name: 'Performance Optimization', difficulty: 'hard', duration: '3 hours', resources: 2, core: false },
          { id: 'nextjs', name: 'Next.js Framework', difficulty: 'hard', duration: '5 hours', resources: 4, core: false }
        ]
      }
    ]
  },
  backend: {
    title: 'Backend Developer',
    phases: [
      {
        name: 'Phase 1: Programming Foundations',
        icon: '💻',
        skills: [
          { id: 'python_basics', name: 'Python Fundamentals', difficulty: 'easy', duration: '5 hours', resources: 4, core: true },
          { id: 'data_structures', name: 'Data Structures', difficulty: 'medium', duration: '6 hours', resources: 5, core: true },
          { id: 'algorithms', name: 'Basic Algorithms', difficulty: 'medium', duration: '5 hours', resources: 4, core: true },
          { id: 'oop', name: 'Object-Oriented Programming', difficulty: 'medium', duration: '4 hours', resources: 3, core: true }
        ]
      },
      {
        name: 'Phase 2: Databases',
        icon: '🗃️',
        skills: [
          { id: 'sql_basics', name: 'SQL Fundamentals', difficulty: 'easy', duration: '4 hours', resources: 3, core: true },
          { id: 'postgresql', name: 'PostgreSQL', difficulty: 'medium', duration: '4 hours', resources: 3, core: true },
          { id: 'mongodb', name: 'MongoDB (NoSQL)', difficulty: 'medium', duration: '3 hours', resources: 3, core: false },
          { id: 'orm', name: 'ORM (Prisma/SQLAlchemy)', difficulty: 'medium', duration: '3 hours', resources: 2, core: false }
        ]
      },
      {
        name: 'Phase 3: API Development',
        icon: '🔌',
        skills: [
          { id: 'rest_api', name: 'REST API Design', difficulty: 'medium', duration: '4 hours', resources: 4, core: true },
          { id: 'nodejs', name: 'Node.js & Express', difficulty: 'medium', duration: '5 hours', resources: 4, core: true },
          { id: 'auth', name: 'Authentication (JWT, OAuth)', difficulty: 'hard', duration: '4 hours', resources: 3, core: true },
          { id: 'graphql', name: 'GraphQL', difficulty: 'hard', duration: '4 hours', resources: 3, core: false }
        ]
      },
      {
        name: 'Phase 4: DevOps Basics',
        icon: '🚀',
        skills: [
          { id: 'git_advanced', name: 'Git & Version Control', difficulty: 'easy', duration: '2 hours', resources: 2, core: true },
          { id: 'docker', name: 'Docker Containers', difficulty: 'hard', duration: '5 hours', resources: 4, core: false },
          { id: 'cicd', name: 'CI/CD Pipelines', difficulty: 'hard', duration: '4 hours', resources: 3, core: false },
          { id: 'cloud', name: 'Cloud Deployment (AWS/GCP)', difficulty: 'hard', duration: '5 hours', resources: 4, core: false }
        ]
      }
    ]
  },
  fullstack: {
    title: 'Full Stack Developer',
    phases: [
      {
        name: 'Phase 1: Frontend Basics',
        icon: '🎨',
        skills: [
          { id: 'html_css', name: 'HTML5 & CSS3', difficulty: 'easy', duration: '4 hours', resources: 4, core: true },
          { id: 'javascript', name: 'JavaScript Essentials', difficulty: 'medium', duration: '6 hours', resources: 5, core: true },
          { id: 'react', name: 'React.js', difficulty: 'medium', duration: '6 hours', resources: 4, core: true },
          { id: 'tailwind', name: 'Tailwind CSS', difficulty: 'easy', duration: '2 hours', resources: 2, core: false }
        ]
      },
      {
        name: 'Phase 2: Backend Basics',
        icon: '⚙️',
        skills: [
          { id: 'nodejs_express', name: 'Node.js & Express', difficulty: 'medium', duration: '5 hours', resources: 4, core: true },
          { id: 'rest_apis', name: 'RESTful APIs', difficulty: 'medium', duration: '4 hours', resources: 3, core: true },
          { id: 'authentication', name: 'User Authentication', difficulty: 'hard', duration: '4 hours', resources: 3, core: true },
          { id: 'error_handling', name: 'Error Handling & Logging', difficulty: 'medium', duration: '2 hours', resources: 2, core: false }
        ]
      },
      {
        name: 'Phase 3: Database & Storage',
        icon: '🗃️',
        skills: [
          { id: 'sql', name: 'SQL Databases', difficulty: 'medium', duration: '5 hours', resources: 4, core: true },
          { id: 'nosql', name: 'NoSQL (MongoDB)', difficulty: 'medium', duration: '3 hours', resources: 3, core: false },
          { id: 'prisma', name: 'Prisma ORM', difficulty: 'medium', duration: '3 hours', resources: 2, core: false },
          { id: 'caching', name: 'Caching (Redis)', difficulty: 'hard', duration: '3 hours', resources: 2, core: false }
        ]
      },
      {
        name: 'Phase 4: Deployment & DevOps',
        icon: '🚀',
        skills: [
          { id: 'git', name: 'Git & GitHub', difficulty: 'easy', duration: '2 hours', resources: 3, core: true },
          { id: 'vercel', name: 'Vercel/Netlify Deployment', difficulty: 'easy', duration: '2 hours', resources: 2, core: true },
          { id: 'docker_basics', name: 'Docker Basics', difficulty: 'hard', duration: '4 hours', resources: 3, core: false },
          { id: 'aws', name: 'AWS Essentials', difficulty: 'hard', duration: '5 hours', resources: 4, core: false }
        ]
      }
    ]
  },
  datascience: {
    title: 'Data Scientist',
    phases: [
      {
        name: 'Phase 1: Python & Math Foundations',
        icon: '🐍',
        skills: [
          { id: 'python', name: 'Python Programming', difficulty: 'easy', duration: '6 hours', resources: 5, core: true },
          { id: 'numpy', name: 'NumPy', difficulty: 'medium', duration: '4 hours', resources: 3, core: true },
          { id: 'statistics', name: 'Statistics Fundamentals', difficulty: 'medium', duration: '5 hours', resources: 4, core: true },
          { id: 'linear_algebra', name: 'Linear Algebra Basics', difficulty: 'hard', duration: '4 hours', resources: 3, core: true }
        ]
      },
      {
        name: 'Phase 2: Data Analysis',
        icon: '📊',
        skills: [
          { id: 'pandas', name: 'Pandas for Data Analysis', difficulty: 'medium', duration: '5 hours', resources: 4, core: true },
          { id: 'visualization', name: 'Data Visualization (Matplotlib, Seaborn)', difficulty: 'medium', duration: '4 hours', resources: 3, core: true },
          { id: 'sql_data', name: 'SQL for Data Science', difficulty: 'medium', duration: '4 hours', resources: 3, core: true },
          { id: 'eda', name: 'Exploratory Data Analysis', difficulty: 'medium', duration: '4 hours', resources: 3, core: false }
        ]
      },
      {
        name: 'Phase 3: Machine Learning',
        icon: '🤖',
        skills: [
          { id: 'ml_fundamentals', name: 'ML Fundamentals', difficulty: 'hard', duration: '6 hours', resources: 5, core: true },
          { id: 'sklearn', name: 'Scikit-learn', difficulty: 'medium', duration: '5 hours', resources: 4, core: true },
          { id: 'supervised', name: 'Supervised Learning', difficulty: 'hard', duration: '5 hours', resources: 4, core: false },
          { id: 'unsupervised', name: 'Unsupervised Learning', difficulty: 'hard', duration: '4 hours', resources: 3, core: false }
        ]
      },
      {
        name: 'Phase 4: Advanced Topics',
        icon: '🧠',
        skills: [
          { id: 'deep_learning', name: 'Deep Learning Intro', difficulty: 'hard', duration: '6 hours', resources: 4, core: false },
          { id: 'nlp', name: 'Natural Language Processing', difficulty: 'hard', duration: '5 hours', resources: 3, core: false },
          { id: 'big_data', name: 'Big Data Tools (Spark)', difficulty: 'hard', duration: '5 hours', resources: 3, core: false },
          { id: 'deployment', name: 'Model Deployment', difficulty: 'hard', duration: '4 hours', resources: 3, core: false }
        ]
      }
    ]
  },
  ml: {
    title: 'ML Engineer',
    phases: [
      {
        name: 'Phase 1: Math & Programming',
        icon: '📐',
        skills: [
          { id: 'linear_algebra', name: 'Linear Algebra', difficulty: 'hard', duration: '6 hours', resources: 4, core: true },
          { id: 'calculus', name: 'Calculus for ML', difficulty: 'hard', duration: '5 hours', resources: 3, core: true },
          { id: 'probability', name: 'Probability & Statistics', difficulty: 'hard', duration: '5 hours', resources: 4, core: true },
          { id: 'python_ml', name: 'Python for ML', difficulty: 'medium', duration: '5 hours', resources: 4, core: true }
        ]
      },
      {
        name: 'Phase 2: Classical ML',
        icon: '📈',
        skills: [
          { id: 'ml_theory', name: 'ML Theory & Concepts', difficulty: 'hard', duration: '6 hours', resources: 5, core: true },
          { id: 'regression', name: 'Regression Models', difficulty: 'medium', duration: '4 hours', resources: 3, core: true },
          { id: 'classification', name: 'Classification Models', difficulty: 'medium', duration: '4 hours', resources: 3, core: true },
          { id: 'model_eval', name: 'Model Evaluation', difficulty: 'medium', duration: '3 hours', resources: 3, core: true }
        ]
      },
      {
        name: 'Phase 3: Deep Learning',
        icon: '🧠',
        skills: [
          { id: 'neural_networks', name: 'Neural Networks', difficulty: 'hard', duration: '6 hours', resources: 5, core: true },
          { id: 'pytorch', name: 'PyTorch', difficulty: 'hard', duration: '6 hours', resources: 4, core: true },
          { id: 'cnn', name: 'CNNs for Computer Vision', difficulty: 'hard', duration: '5 hours', resources: 4, core: false },
          { id: 'rnn', name: 'RNNs & Transformers', difficulty: 'hard', duration: '5 hours', resources: 4, core: false }
        ]
      },
      {
        name: 'Phase 4: MLOps',
        icon: '🚀',
        skills: [
          { id: 'mlflow', name: 'Experiment Tracking (MLflow)', difficulty: 'medium', duration: '3 hours', resources: 2, core: false },
          { id: 'docker_ml', name: 'Docker for ML', difficulty: 'medium', duration: '3 hours', resources: 2, core: false },
          { id: 'model_serving', name: 'Model Serving', difficulty: 'hard', duration: '4 hours', resources: 3, core: false },
          { id: 'ml_pipelines', name: 'ML Pipelines', difficulty: 'hard', duration: '5 hours', resources: 3, core: false }
        ]
      }
    ]
  },
  devops: {
    title: 'DevOps Engineer',
    phases: [
      {
        name: 'Phase 1: Linux & Scripting',
        icon: '🐧',
        skills: [
          { id: 'linux', name: 'Linux Fundamentals', difficulty: 'medium', duration: '5 hours', resources: 4, core: true },
          { id: 'bash', name: 'Bash Scripting', difficulty: 'medium', duration: '4 hours', resources: 3, core: true },
          { id: 'python_devops', name: 'Python for DevOps', difficulty: 'medium', duration: '4 hours', resources: 3, core: true },
          { id: 'networking', name: 'Networking Basics', difficulty: 'medium', duration: '4 hours', resources: 3, core: true }
        ]
      },
      {
        name: 'Phase 2: Version Control & CI/CD',
        icon: '🔄',
        skills: [
          { id: 'git_advanced', name: 'Advanced Git', difficulty: 'medium', duration: '3 hours', resources: 3, core: true },
          { id: 'github_actions', name: 'GitHub Actions', difficulty: 'medium', duration: '4 hours', resources: 3, core: true },
          { id: 'jenkins', name: 'Jenkins', difficulty: 'hard', duration: '5 hours', resources: 4, core: false },
          { id: 'gitlab_ci', name: 'GitLab CI', difficulty: 'medium', duration: '3 hours', resources: 2, core: false }
        ]
      },
      {
        name: 'Phase 3: Containers & Orchestration',
        icon: '🐳',
        skills: [
          { id: 'docker', name: 'Docker', difficulty: 'medium', duration: '5 hours', resources: 4, core: true },
          { id: 'docker_compose', name: 'Docker Compose', difficulty: 'medium', duration: '3 hours', resources: 2, core: true },
          { id: 'kubernetes', name: 'Kubernetes', difficulty: 'hard', duration: '8 hours', resources: 5, core: true },
          { id: 'helm', name: 'Helm Charts', difficulty: 'hard', duration: '4 hours', resources: 3, core: false }
        ]
      },
      {
        name: 'Phase 4: Cloud & IaC',
        icon: '☁️',
        skills: [
          { id: 'aws', name: 'AWS Essentials', difficulty: 'hard', duration: '8 hours', resources: 5, core: true },
          { id: 'terraform', name: 'Terraform', difficulty: 'hard', duration: '6 hours', resources: 4, core: true },
          { id: 'ansible', name: 'Ansible', difficulty: 'medium', duration: '4 hours', resources: 3, core: false },
          { id: 'monitoring', name: 'Monitoring (Prometheus, Grafana)', difficulty: 'hard', duration: '5 hours', resources: 3, core: false }
        ]
      }
    ]
  },
  mobile: {
    title: 'Mobile Developer',
    phases: [
      {
        name: 'Phase 1: Programming Basics',
        icon: '💻',
        skills: [
          { id: 'javascript', name: 'JavaScript', difficulty: 'medium', duration: '6 hours', resources: 5, core: true },
          { id: 'typescript', name: 'TypeScript', difficulty: 'medium', duration: '4 hours', resources: 3, core: true },
          { id: 'react', name: 'React Fundamentals', difficulty: 'medium', duration: '5 hours', resources: 4, core: true },
          { id: 'git', name: 'Git Version Control', difficulty: 'easy', duration: '2 hours', resources: 2, core: true }
        ]
      },
      {
        name: 'Phase 2: React Native',
        icon: '📱',
        skills: [
          { id: 'rn_basics', name: 'React Native Basics', difficulty: 'medium', duration: '6 hours', resources: 4, core: true },
          { id: 'rn_navigation', name: 'Navigation', difficulty: 'medium', duration: '3 hours', resources: 3, core: true },
          { id: 'rn_state', name: 'State Management', difficulty: 'hard', duration: '4 hours', resources: 3, core: true },
          { id: 'rn_native', name: 'Native Modules', difficulty: 'hard', duration: '4 hours', resources: 2, core: false }
        ]
      },
      {
        name: 'Phase 3: Platform Specific',
        icon: '🍎',
        skills: [
          { id: 'ios_basics', name: 'iOS Development Basics', difficulty: 'hard', duration: '5 hours', resources: 3, core: false },
          { id: 'android_basics', name: 'Android Development Basics', difficulty: 'hard', duration: '5 hours', resources: 3, core: false },
          { id: 'flutter', name: 'Flutter (Alternative)', difficulty: 'hard', duration: '6 hours', resources: 4, core: false },
          { id: 'expo', name: 'Expo Framework', difficulty: 'medium', duration: '3 hours', resources: 2, core: true }
        ]
      },
      {
        name: 'Phase 4: Publishing',
        icon: '🚀',
        skills: [
          { id: 'app_store', name: 'App Store Submission', difficulty: 'medium', duration: '3 hours', resources: 2, core: true },
          { id: 'play_store', name: 'Play Store Submission', difficulty: 'medium', duration: '3 hours', resources: 2, core: true },
          { id: 'analytics', name: 'App Analytics', difficulty: 'easy', duration: '2 hours', resources: 2, core: false },
          { id: 'crash_reporting', name: 'Crash Reporting', difficulty: 'easy', duration: '2 hours', resources: 2, core: false }
        ]
      }
    ]
  },
  uiux: {
    title: 'UI/UX Designer',
    phases: [
      {
        name: 'Phase 1: Design Fundamentals',
        icon: '🎨',
        skills: [
          { id: 'design_principles', name: 'Design Principles', difficulty: 'easy', duration: '4 hours', resources: 4, core: true },
          { id: 'color_theory', name: 'Color Theory', difficulty: 'easy', duration: '3 hours', resources: 3, core: true },
          { id: 'typography', name: 'Typography', difficulty: 'medium', duration: '3 hours', resources: 3, core: true },
          { id: 'layout', name: 'Layout & Composition', difficulty: 'medium', duration: '4 hours', resources: 3, core: true }
        ]
      },
      {
        name: 'Phase 2: Tools & Prototyping',
        icon: '🛠️',
        skills: [
          { id: 'figma', name: 'Figma Mastery', difficulty: 'medium', duration: '6 hours', resources: 5, core: true },
          { id: 'wireframing', name: 'Wireframing', difficulty: 'easy', duration: '3 hours', resources: 3, core: true },
          { id: 'prototyping', name: 'Interactive Prototyping', difficulty: 'medium', duration: '4 hours', resources: 3, core: true },
          { id: 'design_systems', name: 'Design Systems', difficulty: 'hard', duration: '5 hours', resources: 4, core: false }
        ]
      },
      {
        name: 'Phase 3: UX Research',
        icon: '🔍',
        skills: [
          { id: 'user_research', name: 'User Research Methods', difficulty: 'medium', duration: '5 hours', resources: 4, core: true },
          { id: 'personas', name: 'User Personas', difficulty: 'easy', duration: '2 hours', resources: 2, core: true },
          { id: 'user_journeys', name: 'User Journey Mapping', difficulty: 'medium', duration: '3 hours', resources: 3, core: false },
          { id: 'usability', name: 'Usability Testing', difficulty: 'hard', duration: '4 hours', resources: 3, core: false }
        ]
      },
      {
        name: 'Phase 4: Advanced Design',
        icon: '✨',
        skills: [
          { id: 'motion', name: 'Motion Design', difficulty: 'hard', duration: '5 hours', resources: 3, core: false },
          { id: 'accessibility', name: 'Accessibility (a11y)', difficulty: 'medium', duration: '3 hours', resources: 3, core: true },
          { id: 'handoff', name: 'Developer Handoff', difficulty: 'easy', duration: '2 hours', resources: 2, core: true },
          { id: 'portfolio', name: 'Portfolio Building', difficulty: 'medium', duration: '4 hours', resources: 3, core: false }
        ]
      }
    ]
  }
};

// ============================================
// User State Management
// ============================================
function getUserData() {
  const data = localStorage.getItem('internpath_user');
  return data ? JSON.parse(data) : null;
}

function getProgress() {
  const data = localStorage.getItem('internpath_progress');
  return data ? JSON.parse(data) : { completedSkills: [], tasks: [], streakData: { current: 0, longest: 0, lastActive: null } };
}

function saveProgress(progress) {
  localStorage.setItem('internpath_progress', JSON.stringify(progress));
}

// ============================================
// Dashboard Initialization
// ============================================
function initDashboard() {
  const userData = getUserData();

  if (!userData) {
    window.location.href = 'onboarding.html';
    return;
  }

  // Update welcome message
  document.getElementById('welcomeMessage').textContent = `Welcome back, ${userData.name}! 👋`;
  document.getElementById('userDetails').textContent = `${userData.branch} • Year ${userData.year} • ${roadmapTemplates[userData.goal]?.title || 'Developer'}`;

  // Update goal title
  document.getElementById('goalTitle').textContent = roadmapTemplates[userData.goal]?.title || 'Developer';

  // Update current date
  const today = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = today.toLocaleDateString('en-US', dateOptions);
  document.getElementById('currentDate').textContent = dateStr;
  document.getElementById('todayDate').textContent = dateStr;

  // Generate roadmap
  generateRoadmap(userData.goal);

  // Load progress
  updateProgressDisplays();

  // Generate trend chart
  generateTrendChart();

  // Update streak data
  updateStreakDisplay();
}

// ============================================
// Roadmap Generation (Dynamic based on user skills)
// ============================================
function generateRoadmap(goal) {
  const userData = getUserData();
  const userSkills = userData?.currentSkills || {};

  // Generate dynamic roadmap based on user's skills
  const dynamicRoadmap = generateDynamicRoadmap(goal, userSkills);
  if (!dynamicRoadmap) return;

  const container = document.getElementById('roadmapContainer');
  const progress = getProgress();

  let totalSkills = 0;
  let completedCount = 0;
  let knownFromStart = 0;

  let html = '';

  dynamicRoadmap.phases.forEach((phase, phaseIndex) => {
    const phaseSkills = phase.skills;

    // Count skills in different states
    const phaseCompleted = phaseSkills.filter(s =>
      progress.completedSkills.includes(s.id) || s.status === 'known'
    ).length;

    totalSkills += phaseSkills.length;
    completedCount += phaseSkills.filter(s => progress.completedSkills.includes(s.id)).length;
    knownFromStart += phaseSkills.filter(s => s.status === 'known').length;

    html += `
      <div class="roadmap-phase" data-phase="${phaseIndex}">
        <div class="phase-header" onclick="togglePhase(${phaseIndex})">
          <div class="phase-info">
            <span class="phase-icon">${phase.icon}</span>
            <span class="phase-name">${phase.name}</span>
            <span class="phase-status">${phaseCompleted}/${phaseSkills.length} completed</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="phase-chevron">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div class="phase-content" id="phase-content-${phaseIndex}" style="display: ${phaseIndex === 0 ? 'block' : 'none'};">
          ${phaseSkills.map(skill => {
      const isCompleted = progress.completedSkills.includes(skill.id);
      const isKnown = skill.status === 'known';
      const needsUpgrade = skill.status === 'upgrade';
      const isNew = skill.status === 'new';

      // Determine visual state
      let statusIcon = '';
      let statusClass = '';
      let statusLabel = '';

      if (isCompleted) {
        statusIcon = '✅';
        statusClass = 'completed';
        statusLabel = 'Completed';
      } else if (isKnown) {
        statusIcon = '✓';
        statusClass = 'known';
        statusLabel = `Already ${skill.userLevel}`;
      } else if (needsUpgrade) {
        statusIcon = '🔄';
        statusClass = 'upgrade';
        statusLabel = `${skill.userLevel} → ${skill.requiredLevel}`;
      } else {
        statusIcon = '';
        statusClass = 'new';
        statusLabel = 'New skill';
      }

      const skillProgress = isCompleted ? 100 : (isKnown ? 100 : 0);

      return `
              <div class="skill-item ${statusClass}" style="${isKnown ? 'opacity: 0.6;' : ''}">
                <div class="skill-checkbox ${isCompleted || isKnown ? 'checked' : ''}" 
                     onclick="${isKnown ? '' : `toggleSkillComplete('${skill.id}', this)`}"
                     style="${isKnown ? 'pointer-events: none; background: #22C55E;' : ''}">
                </div>
                <div class="skill-info">
                  <div class="skill-name">
                    ${skill.name} 
                    ${skill.core ? '<span style="color: var(--accent); font-size: 10px;">★ CORE</span>' : ''}
                    ${needsUpgrade ? `<span style="color: #FF9800; font-size: 10px; margin-left: 8px;">🔄 UPGRADE</span>` : ''}
                    ${isKnown ? `<span style="color: #22C55E; font-size: 10px; margin-left: 8px;">✓ KNOWN</span>` : ''}
                  </div>
                  <div class="skill-meta">
                    <span class="skill-badge ${skill.difficulty}">${skill.difficulty.toUpperCase()}</span>
                    <span>⏱️ ${skill.duration}</span>
                    <span>📚 ${skill.resources} resources</span>
                    ${needsUpgrade || isKnown ? `<span style="color: ${isKnown ? '#22C55E' : '#FF9800'};">${statusLabel}</span>` : ''}
                  </div>
                </div>
                <div class="skill-progress">
                  <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: ${skillProgress}%; ${isKnown ? 'background: #22C55E;' : ''}"></div>
                  </div>
                </div>
              </div>
            `;
    }).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Update summary with known skills info
  const summaryText = knownFromStart > 0
    ? `${completedCount}/${totalSkills} completed (${knownFromStart} already known)`
    : `${completedCount}/${totalSkills} skills completed`;
  document.getElementById('roadmapSummary').textContent = summaryText;
}

function togglePhase(phaseIndex) {
  const content = document.getElementById(`phase-content-${phaseIndex}`);
  const chevron = content.previousElementSibling.querySelector('.phase-chevron');

  if (content.style.display === 'none') {
    content.style.display = 'block';
    chevron.style.transform = 'rotate(180deg)';
  } else {
    content.style.display = 'none';
    chevron.style.transform = 'rotate(0deg)';
  }
}

function toggleSkillComplete(skillId, element) {
  const progress = getProgress();
  let isCompleting = false;

  if (progress.completedSkills.includes(skillId)) {
    // Unchecking - remove from completed
    progress.completedSkills = progress.completedSkills.filter(id => id !== skillId);
    element.classList.remove('checked');
  } else {
    // Checking - add to completed
    progress.completedSkills.push(skillId);
    element.classList.add('checked');
    isCompleting = true;
  }

  saveProgress(progress);
  updateProgressDisplays();

  // Record daily progress AFTER saving the main progress
  if (isCompleting) {
    recordDailyProgress(skillId);
  } else {
    removeDailyProgress(skillId);
  }

  // Remember which phases are expanded before re-render
  const expandedPhases = [];
  document.querySelectorAll('[id^="phase-content-"]').forEach(el => {
    if (el.style.display !== 'none') {
      const phaseIndex = el.id.replace('phase-content-', '');
      expandedPhases.push(phaseIndex);
    }
  });

  // Refresh roadmap to update phase counts
  const userData = getUserData();
  if (userData) {
    generateRoadmap(userData.goal);
  }

  // Restore expanded phases after re-render
  // First, close ALL phases (including phase 0 which opens by default)
  document.querySelectorAll('[id^="phase-content-"]').forEach(el => {
    const chevron = el.previousElementSibling?.querySelector('.phase-chevron');
    el.style.display = 'none';
    if (chevron) chevron.style.transform = 'rotate(0deg)';
  });

  // Then re-open only the ones that were expanded before
  expandedPhases.forEach(phaseIndex => {
    const content = document.getElementById(`phase-content-${phaseIndex}`);
    const chevron = content?.previousElementSibling?.querySelector('.phase-chevron');
    if (content) {
      content.style.display = 'block';
      if (chevron) chevron.style.transform = 'rotate(180deg)';
    }
  });
}

// ============================================
// Progress Calculations
// ============================================
function updateProgressDisplays() {
  const userData = getUserData();
  const progress = getProgress();

  if (!userData) return;

  const template = roadmapTemplates[userData.goal];
  const weights = skillWeights[userData.goal] || {};
  if (!template) return;

  // Level multipliers
  const levelMultipliers = { beginner: 0.3, intermediate: 0.6, advanced: 1.0 };

  // ====== ROADMAP PROGRESS (simple count) ======
  let totalSkills = 0;
  let completedSkills = 0;

  template.phases.forEach(phase => {
    phase.skills.forEach(skill => {
      totalSkills++;
      if (progress.completedSkills.includes(skill.id)) {
        completedSkills++;
      }
    });
  });

  const roadmapPercent = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;

  // ====== INTERNSHIP READINESS (weighted calculation) ======
  // Collect all unique skills and their weights
  const allSkillsMap = new Map();

  // Add roadmap skills
  template.phases.forEach(phase => {
    phase.skills.forEach(skill => {
      const weight = weights[skill.id] || 5; // Default weight 5 if not defined
      if (!allSkillsMap.has(skill.id) || allSkillsMap.get(skill.id).weight < weight) {
        allSkillsMap.set(skill.id, { id: skill.id, name: skill.name, weight });
      }
    });
  });

  // Add user's existing skills from onboarding (IMPORTANT: add them to the map!)
  const userCurrentSkills = userData.currentSkills || {};

  // Add onboarding skills to the map if not already present
  Object.keys(userCurrentSkills).forEach(skillId => {
    if (!allSkillsMap.has(skillId)) {
      const weight = weights[skillId] || 5; // Get weight from config or default to 5
      allSkillsMap.set(skillId, { id: skillId, name: skillId, weight });
    }
  });

  // Calculate scores
  let userScore = 0;
  let maxScore = 0;
  const skillAnalysis = { strong: [], gaps: [], minor: [] };

  allSkillsMap.forEach((skillData, skillId) => {
    const weight = skillData.weight;
    maxScore += weight; // Max is if user had advanced (1.0) in everything

    let contribution = 0;
    let level = 'none';
    let source = '';

    // Check if user has this skill from onboarding
    if (userCurrentSkills[skillId]) {
      level = userCurrentSkills[skillId];
      contribution = weight * (levelMultipliers[level] || 0);
      source = 'onboarding';
    }

    // Check if completed in roadmap (overrides/adds to onboarding if better)
    if (progress.completedSkills.includes(skillId)) {
      // Completed = treat as advanced (1.0)
      const roadmapContribution = weight * 1.0;
      if (roadmapContribution > contribution) {
        contribution = roadmapContribution;
        level = 'completed';
        source = 'roadmap';
      }
    }

    userScore += contribution;

    // Categorize for skill analysis
    if (contribution >= weight * 0.6) {
      // Strong: at least intermediate or completed
      skillAnalysis.strong.push({ ...skillData, level, contribution, source });
    } else if (weight >= 7 && contribution < weight * 0.6) {
      // Critical gap: high-weight skill that's weak or missing
      skillAnalysis.gaps.push({ ...skillData, level, contribution, source, missing: contribution === 0 });
    } else if (contribution < weight * 0.3) {
      // Minor gap: lower-weight skill that's weak
      skillAnalysis.minor.push({ ...skillData, level, contribution, source });
    }
  });

  const internshipPercent = maxScore > 0 ? Math.round((userScore / maxScore) * 100) : 0;

  // ====== UPDATE UI ======
  // Roadmap progress
  const roadmapCircle = document.getElementById('roadmapCircle');
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (roadmapPercent / 100) * circumference;
  roadmapCircle.style.strokeDasharray = circumference;
  roadmapCircle.style.strokeDashoffset = offset;
  document.getElementById('roadmapPercent').textContent = `${roadmapPercent}%`;
  document.getElementById('roadmapBar').style.width = `${roadmapPercent}%`;
  document.getElementById('roadmapStatus').textContent = `${completedSkills}/${totalSkills} skills completed`;

  // Internship readiness
  const internshipCircle = document.getElementById('internshipCircle');
  const internOffset = circumference - (internshipPercent / 100) * circumference;
  internshipCircle.style.strokeDasharray = circumference;
  internshipCircle.style.strokeDashoffset = internOffset;
  document.getElementById('internshipPercent').textContent = `${internshipPercent}%`;
  document.getElementById('internshipBar').style.width = `${internshipPercent}%`;

  // Status message based on readiness
  let statusMsg = '';
  if (internshipPercent < 20) {
    statusMsg = 'Build your foundation first';
  } else if (internshipPercent < 40) {
    statusMsg = 'Learning the essentials';
  } else if (internshipPercent < 60) {
    statusMsg = 'Good progress! Keep going';
  } else if (internshipPercent < 75) {
    statusMsg = 'Getting ready for applications';
  } else if (internshipPercent < 90) {
    statusMsg = 'Almost internship ready! 🎯';
  } else {
    statusMsg = 'You\'re ready! Start applying! 🚀';
  }
  document.getElementById('internshipStatus').textContent = statusMsg;

  // Display user's existing skills
  displayUserSkills(userData.currentSkills, skillAnalysis);
}

// ============================================
// Streak Management
// ============================================
function updateStreakDisplay() {
  const progress = getProgress();

  document.getElementById('currentStreak').textContent = progress.streakData.current;
  document.getElementById('longestStreak').textContent = progress.streakData.longest;

  // Week stats (simplified)
  document.getElementById('weekCompleted').textContent = Math.min(progress.streakData.current, 7);
  document.getElementById('weekMissed').textContent = Math.max(0, 7 - progress.streakData.current);
}

// ============================================
// Trend Chart
// ============================================
function generateTrendChart() {
  const chart = document.getElementById('trendChart');
  const heights = [30, 45, 35, 60, 75, 85, 100];

  chart.innerHTML = heights.map(h => `<div class="bar" style="height: ${h}%;"></div>`).join('');
}

// ============================================
// Task Management
// ============================================
function addTask() {
  const taskName = prompt('Enter your task for today:');
  if (!taskName) return;

  const progress = getProgress();
  if (!progress.tasks) progress.tasks = [];

  progress.tasks.push({
    id: Date.now(),
    name: taskName,
    completed: false,
    createdAt: new Date().toISOString()
  });

  saveProgress(progress);
  renderTasks();
}

function renderTasks() {
  const progress = getProgress();
  const container = document.getElementById('focusTasks');

  const todayTasks = (progress.tasks || []).filter(t => {
    const taskDate = new Date(t.createdAt).toDateString();
    return taskDate === new Date().toDateString();
  });

  if (todayTasks.length === 0) {
    container.innerHTML = `
      <div class="focus-empty-icon">📋</div>
      <div class="focus-empty-title">No mission objectives</div>
      <div class="focus-empty-desc">Set your focus for today to begin your mission</div>
      <button class="btn btn-primary" onclick="addTask()">+ Set First Objective</button>
    `;
    return;
  }

  container.innerHTML = `
    <div style="text-align: left;">
      ${todayTasks.map(task => `
        <div class="skill-item" style="margin-bottom: 8px;">
          <div class="skill-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})"></div>
          <div class="skill-info">
            <div class="skill-name" style="${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${task.name}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function toggleTask(taskId) {
  const progress = getProgress();
  const task = progress.tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveProgress(progress);
    renderTasks();
  }
}

// ============================================
// Utility Functions
// ============================================
function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Display user's skills with weighted analysis
function displayUserSkills(currentSkills, skillAnalysis) {
  const container = document.getElementById('masteryList');
  if (!container) return;

  const skills = currentSkills || {};
  const analysis = skillAnalysis || { strong: [], gaps: [], minor: [] };

  // Format skill names nicely
  const formatSkillName = (id) => {
    return id.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const levelIcons = {
    none: '❌',
    beginner: '🌱',
    intermediate: '🌿',
    advanced: '🌳',
    completed: '✅'
  };

  const levelColors = {
    none: '#666',
    beginner: '#4CAF50',
    intermediate: '#FF9800',
    advanced: '#9C27B0',
    completed: '#22C55E'
  };

  // Build HTML for skill analysis section
  let html = '';

  // Strong skills section
  if (analysis.strong.length > 0) {
    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 13px; font-weight: 600; color: #22C55E; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
          <span>💪</span> Strong Areas
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${analysis.strong.slice(0, 5).map(s => `
            <div style="
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 6px 12px;
              background: rgba(34, 197, 94, 0.1);
              border: 1px solid rgba(34, 197, 94, 0.3);
              border-radius: 20px;
              font-size: 12px;
            ">
              <span>${levelIcons[s.level] || '✅'}</span>
              <span>${s.name || formatSkillName(s.id)}</span>
              <span style="color: rgba(255,255,255,0.5); font-size: 10px;">${s.weight}/10</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Critical gaps section
  if (analysis.gaps.length > 0) {
    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 13px; font-weight: 600; color: #EF4444; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
          <span>⚠️</span> Focus Areas (High Priority)
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${analysis.gaps.slice(0, 5).map(s => `
            <div style="
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 6px 12px;
              background: rgba(239, 68, 68, 0.1);
              border: 1px solid rgba(239, 68, 68, 0.3);
              border-radius: 20px;
              font-size: 12px;
            ">
              <span>${s.missing ? '❌' : levelIcons[s.level]}</span>
              <span>${s.name || formatSkillName(s.id)}</span>
              <span style="color: rgba(255,255,255,0.5); font-size: 10px;">${s.weight}/10</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // If no analysis, show basic skill list
  if (analysis.strong.length === 0 && analysis.gaps.length === 0) {
    const skillEntries = Object.entries(skills);
    if (skillEntries.length === 0) {
      html = `
        <p class="text-muted text-center" style="padding: 20px;">
          Complete the roadmap to build your skills!
        </p>
      `;
    } else {
      html = skillEntries.map(([skillId, level]) => `
        <div style="display: flex; align-items: center; gap: 10px; padding: 8px 0;">
          <span>${levelIcons[level] || '🌱'}</span>
          <span style="font-size: 14px;">${formatSkillName(skillId)}</span>
          <span style="color: ${levelColors[level]}; font-size: 12px; text-transform: capitalize;">${level}</span>
        </div>
      `).join('');
    }
  }

  // Info footer
  html += `
    <p class="text-muted text-center mt-lg" style="font-size: 11px; margin-top: 16px;">
      Skill weights are based on industry importance for your career goal
    </p>
  `;

  container.innerHTML = html;
}

// Initialize on page load if on dashboard
if (document.getElementById('roadmapContainer')) {
  document.addEventListener('DOMContentLoaded', initDashboard);
}

// ============================================
// Tab Switching
// ============================================
function switchTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Remove active from all sidebar links
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.remove('active');
  });

  // Show selected tab
  const selectedTab = document.getElementById(`tab-${tabName}`);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }

  // Activate sidebar link
  const selectedLink = document.querySelector(`.sidebar-link[data-tab="${tabName}"]`);
  if (selectedLink) {
    selectedLink.classList.add('active');
  }

  // If switching to roadmap tab, generate detailed roadmap
  if (tabName === 'roadmap') {
    generateDetailedRoadmap();
  }

  // If switching to matrix tab, initialize heatmap
  if (tabName === 'matrix') {
    initMatrixTab();
  }

  // If switching to profile tab, initialize profile
  if (tabName === 'profile') {
    initProfileTab();
  }
}

// ============================================
// Skill Resources (Curated Learning Links)
// ============================================
const skillResources = {
  // Frontend
  html: [
    { type: 'video', name: 'HTML Crash Course', url: 'https://www.youtube.com/watch?v=UB1O30fR-EE' },
    { type: 'docs', name: 'MDN HTML Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML' },
    { type: 'practice', name: 'freeCodeCamp HTML', url: 'https://www.freecodecamp.org/learn/responsive-web-design/' }
  ],
  css: [
    { type: 'video', name: 'CSS Flexbox Tutorial', url: 'https://www.youtube.com/watch?v=JJSoEo8JSnc' },
    { type: 'docs', name: 'CSS-Tricks Flexbox', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/' },
    { type: 'practice', name: 'Flexbox Froggy', url: 'https://flexboxfroggy.com/' }
  ],
  javascript: [
    { type: 'video', name: 'JavaScript Full Course', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg' },
    { type: 'docs', name: 'JavaScript.info', url: 'https://javascript.info/' },
    { type: 'practice', name: 'LeetCode JS', url: 'https://leetcode.com/problemset/' }
  ],
  react: [
    { type: 'video', name: 'React Tutorial', url: 'https://www.youtube.com/watch?v=bMknfKXIFA8' },
    { type: 'docs', name: 'React Docs', url: 'https://react.dev/' },
    { type: 'practice', name: 'React Challenges', url: 'https://react-tutorial.app/' }
  ],
  // ML & Python
  python_ml: [
    { type: 'video', name: 'Python for ML', url: 'https://www.youtube.com/watch?v=7eh4d6sabA0' },
    { type: 'docs', name: 'Python Docs', url: 'https://docs.python.org/3/' },
    { type: 'practice', name: 'Kaggle Python', url: 'https://www.kaggle.com/learn/python' }
  ],
  linear_algebra: [
    { type: 'video', name: '3Blue1Brown Linear Algebra', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab' },
    { type: 'docs', name: 'Khan Academy', url: 'https://www.khanacademy.org/math/linear-algebra' },
    { type: 'practice', name: 'MIT OCW', url: 'https://ocw.mit.edu/courses/mathematics/18-06-linear-algebra-spring-2010/' }
  ],
  ml_theory: [
    { type: 'video', name: 'Andrew Ng ML Course', url: 'https://www.coursera.org/learn/machine-learning' },
    { type: 'docs', name: 'Scikit-learn Docs', url: 'https://scikit-learn.org/stable/user_guide.html' },
    { type: 'practice', name: 'Kaggle ML', url: 'https://www.kaggle.com/learn/intro-to-machine-learning' }
  ],
  pytorch: [
    { type: 'video', name: 'PyTorch Tutorial', url: 'https://www.youtube.com/watch?v=c36lUUr864M' },
    { type: 'docs', name: 'PyTorch Docs', url: 'https://pytorch.org/tutorials/' },
    { type: 'practice', name: 'PyTorch Examples', url: 'https://github.com/pytorch/examples' }
  ],
  // Default resources for skills without specific links
  default: [
    { type: 'video', name: 'YouTube Tutorial', url: 'https://www.youtube.com/results?search_query=' },
    { type: 'docs', name: 'Documentation', url: 'https://www.google.com/search?q=' },
    { type: 'practice', name: 'Practice', url: 'https://www.google.com/search?q=' }
  ]
};

const resourceIcons = {
  video: '📹',
  docs: '📖',
  practice: '💻',
  course: '🎓',
  book: '📚'
};

// ============================================
// Detailed Roadmap Generation
// ============================================
function generateDetailedRoadmap() {
  const userData = getUserData();
  if (!userData) return;

  const userSkills = userData.currentSkills || {};
  const goal = userData.goal;

  // Generate dynamic roadmap
  const dynamicRoadmap = generateDynamicRoadmap(goal, userSkills);
  if (!dynamicRoadmap) return;

  const progress = getProgress();
  const container = document.getElementById('detailedRoadmapContainer');

  // Update header progress and count skill statuses
  let totalSkills = 0;
  let completedSkills = 0;
  let knownCount = 0;
  let upgradeCount = 0;
  let newCount = 0;

  dynamicRoadmap.phases.forEach(phase => {
    totalSkills += phase.skills.length;
    phase.skills.forEach(s => {
      if (progress.completedSkills.includes(s.id) || s.status === 'known') {
        completedSkills++;
        knownCount++;
      } else if (s.status === 'upgrade') {
        upgradeCount++;
      } else {
        newCount++;
      }
    });
  });

  const progressPercent = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;
  const progressEl = document.getElementById('roadmapDetailProgress');
  if (progressEl) progressEl.textContent = `${progressPercent}%`;

  const titleEl = document.getElementById('roadmapDetailTitle');
  if (titleEl) titleEl.textContent = `${dynamicRoadmap.title} • ${totalSkills} skills to master`;

  // Update quick stats
  const knownEl = document.getElementById('knownSkillsCount');
  const upgradeEl = document.getElementById('upgradeSkillsCount');
  const newEl = document.getElementById('newSkillsCount');
  if (knownEl) knownEl.textContent = knownCount;
  if (upgradeEl) upgradeEl.textContent = upgradeCount;
  if (newEl) newEl.textContent = newCount;

  // Generate phase cards
  let html = '';

  dynamicRoadmap.phases.forEach((phase, phaseIndex) => {
    const phaseSkills = phase.skills;
    const phaseCompleted = phaseSkills.filter(s =>
      progress.completedSkills.includes(s.id) || s.status === 'known'
    ).length;
    const phaseProgress = phaseSkills.length > 0 ? Math.round((phaseCompleted / phaseSkills.length) * 100) : 0;

    html += `
      <div class="roadmap-detail-phase">
        <div class="roadmap-detail-phase-header" onclick="toggleDetailedPhase(${phaseIndex})">
          <div class="roadmap-detail-phase-info">
            <div class="roadmap-detail-phase-icon">${phase.icon}</div>
            <div>
              <div class="roadmap-detail-phase-title">${phase.name}</div>
              <div class="roadmap-detail-phase-subtitle">${phaseSkills.length} skills • ${phaseSkills.filter(s => s.core).length} core</div>
            </div>
          </div>
          <div class="roadmap-detail-phase-progress">
            <div class="roadmap-detail-phase-progress-value">${phaseProgress}%</div>
            <div class="roadmap-detail-phase-progress-label">${phaseCompleted}/${phaseSkills.length} complete</div>
          </div>
        </div>
        <div class="roadmap-detail-phase-content" id="detail-phase-${phaseIndex}" style="display: ${phaseIndex === 0 ? 'block' : 'none'};">
          ${phaseSkills.map(skill => generateSkillDetailCard(skill, progress)).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function generateSkillDetailCard(skill, progress) {
  const isCompleted = progress.completedSkills.includes(skill.id);
  const isKnown = skill.status === 'known';
  const needsUpgrade = skill.status === 'upgrade';

  // Get resources for this skill
  const resources = skillResources[skill.id] || skillResources.default.map(r => ({
    ...r,
    url: r.url + encodeURIComponent(skill.name + ' tutorial')
  }));

  let statusBadge = '';
  let statusClass = 'new';

  if (isCompleted) {
    statusBadge = '<span class="status-known">✓ Completed</span>';
    statusClass = 'known';
  } else if (isKnown) {
    statusBadge = `<span class="status-known">✓ Already ${skill.userLevel}</span>`;
    statusClass = 'known';
  } else if (needsUpgrade) {
    statusBadge = `<span class="status-upgrade">🔄 ${skill.userLevel} → ${skill.requiredLevel}</span>`;
    statusClass = 'upgrade';
  } else {
    statusBadge = '<span class="status-new">New skill</span>';
    statusClass = 'new';
  }

  return `
    <div class="skill-detail-card ${statusClass}">
      <div class="skill-detail-header">
        <div>
          <div class="skill-detail-title">
            ${skill.name}
            ${skill.core ? '<span style="color: var(--accent); font-size: 11px;">★ CORE</span>' : ''}
          </div>
          <div class="skill-detail-badges">
            ${statusBadge}
            <span class="skill-badge ${skill.difficulty}">${skill.difficulty.toUpperCase()}</span>
          </div>
        </div>
      </div>
      <div class="skill-detail-meta">
        <span>⏱️ ${skill.duration}</span>
        <span>📚 ${skill.resources} resources</span>
        <span>⚡ Weight: ${skill.weight}/10</span>
      </div>
      <div class="resource-links">
        ${resources.map(r => `
          <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="resource-link">
            <span class="resource-link-icon">${resourceIcons[r.type] || '🔗'}</span>
            <span class="resource-link-text">${r.name}</span>
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

function toggleDetailedPhase(phaseIndex) {
  const content = document.getElementById(`detail-phase-${phaseIndex}`);
  if (content.style.display === 'none') {
    content.style.display = 'block';
  } else {
    content.style.display = 'none';
  }
}

// ============================================
// Date Navigation & Progress Tracking
// ============================================
let selectedDate = new Date(); // Currently viewed date

function changeDate(direction) {
  selectedDate = new Date(selectedDate);
  selectedDate.setDate(selectedDate.getDate() + direction);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(selectedDate);
  selected.setHours(0, 0, 0, 0);

  // Don't allow going to future dates
  if (selected > today) {
    selectedDate = today;
    return;
  }

  updateDateDisplay();
  updateViewMode();
  renderTasks();
  updateTodaysFocus();
}

function updateDateDisplay() {
  const dateEl = document.getElementById('currentDate');
  const todayBadge = document.getElementById('todayBadge');

  if (dateEl) {
    dateEl.textContent = formatDate(selectedDate);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(selectedDate);
  selected.setHours(0, 0, 0, 0);

  const isToday = selected.getTime() === today.getTime();

  if (todayBadge) {
    todayBadge.style.display = isToday ? 'inline' : 'none';
  }

  // Also update Today's Focus date
  const todayDateEl = document.getElementById('todayDate');
  if (todayDateEl) {
    todayDateEl.textContent = formatDate(selectedDate);
  }
}

function updateViewMode() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(selectedDate);
  selected.setHours(0, 0, 0, 0);

  const isToday = selected.getTime() === today.getTime();
  const isPast = selected < today;

  // Disable/enable checkboxes based on view mode
  const checkboxes = document.querySelectorAll('.skill-checkbox');
  checkboxes.forEach(cb => {
    if (isPast) {
      cb.style.pointerEvents = 'none';
      cb.style.opacity = '0.5';
    } else {
      cb.style.pointerEvents = 'auto';
      cb.style.opacity = '1';
    }
  });

  // Show view-only indicator for past dates
  const addTaskBtn = document.querySelector('.focus-header .btn-secondary');
  if (addTaskBtn) {
    if (isPast) {
      addTaskBtn.textContent = '👁️ View Only';
      addTaskBtn.disabled = true;
      addTaskBtn.style.opacity = '0.5';
    } else {
      addTaskBtn.textContent = '+ Add Task';
      addTaskBtn.disabled = false;
      addTaskBtn.style.opacity = '1';
    }
  }
}

// ============================================
// Daily History Tracking
// ============================================

// Helper function to get local date in YYYY-MM-DD format
function getLocalDateKey(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function recordDailyProgress(skillId) {
  const progress = getProgress();
  const dateKey = getLocalDateKey(); // Use local date

  if (!progress.dailyHistory) {
    progress.dailyHistory = {};
  }

  if (!progress.dailyHistory[dateKey]) {
    progress.dailyHistory[dateKey] = [];
  }

  if (!progress.dailyHistory[dateKey].includes(skillId)) {
    progress.dailyHistory[dateKey].push(skillId);
  }

  saveProgress(progress);
  updateStreakFromHistory();
  updateWeekStats();
  updateTrendChart();
}

function removeDailyProgress(skillId) {
  const progress = getProgress();
  const dateKey = getLocalDateKey(); // Use local date

  if (progress.dailyHistory && progress.dailyHistory[dateKey]) {
    progress.dailyHistory[dateKey] = progress.dailyHistory[dateKey].filter(id => id !== skillId);
  }

  saveProgress(progress);
  updateStreakFromHistory();
  updateWeekStats();
  updateTrendChart();
}

// ============================================
// Streak Calculation
// ============================================
function updateStreakFromHistory() {
  const progress = getProgress();
  const dailyHistory = progress.dailyHistory || {};

  // Get sorted dates
  const dates = Object.keys(dailyHistory)
    .filter(d => dailyHistory[d].length > 0)
    .sort((a, b) => new Date(b) - new Date(a)); // Newest first

  if (dates.length === 0) {
    progress.streakData = { current: 0, longest: progress.streakData?.longest || 0, lastActive: null };
    saveProgress(progress);
    updateStreakDisplay();
    return;
  }

  // Calculate current streak (consecutive days from today)
  let currentStreak = 0;
  let checkDate = new Date();

  while (true) {
    const dateKey = getLocalDateKey(checkDate);
    if (dailyHistory[dateKey] && dailyHistory[dateKey].length > 0) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (currentStreak === 0) {
      // Check if yesterday had progress (streak not broken yet today)
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayKey = getLocalDateKey(checkDate);
      if (dailyHistory[yesterdayKey] && dailyHistory[yesterdayKey].length > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  // Update longest streak if current is greater
  const longestStreak = Math.max(currentStreak, progress.streakData?.longest || 0);

  progress.streakData = {
    current: currentStreak,
    longest: longestStreak,
    lastActive: dates[0]
  };

  saveProgress(progress);
  updateStreakDisplay();
}

function updateStreakDisplay() {
  const progress = getProgress();
  const currentEl = document.getElementById('currentStreak');
  const longestEl = document.getElementById('longestStreak');

  if (currentEl) {
    currentEl.textContent = progress.streakData?.current || 0;
  }
  if (longestEl) {
    longestEl.textContent = progress.streakData?.longest || 0;
  }
}

// ============================================
// This Week Stats
// ============================================
function updateWeekStats() {
  const progress = getProgress();
  const dailyHistory = progress.dailyHistory || {};

  // Get the start of the week (Monday)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(today.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  // Count days with completions this week
  let completedDays = 0;
  let checkDate = new Date(weekStart);
  const now = new Date();

  while (checkDate <= now) {
    const dateKey = getLocalDateKey(checkDate);
    if (dailyHistory[dateKey] && dailyHistory[dateKey].length > 0) {
      completedDays++;
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }

  // Calculate elapsed days this week
  const todayDate = new Date();
  const elapsedDays = Math.min(7, Math.floor((todayDate - weekStart) / (1000 * 60 * 60 * 24)) + 1);
  const missedDays = elapsedDays - completedDays;

  // Update display
  const completedEl = document.getElementById('weekCompleted');
  const missedEl = document.getElementById('weekMissed');
  const totalEl = document.getElementById('weekTotal');

  if (completedEl) completedEl.textContent = completedDays;
  if (missedEl) missedEl.textContent = missedDays;
  if (totalEl) totalEl.textContent = `${elapsedDays}/7`;
}

// ============================================
// 7-Day Trend Chart
// ============================================
function updateTrendChart() {
  const progress = getProgress();
  const dailyHistory = progress.dailyHistory || {};

  const chart = document.getElementById('trendChart');
  if (!chart) return;

  // Get last 7 days
  const heights = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = getLocalDateKey(date);

    const skillsCompleted = dailyHistory[dateKey]?.length || 0;
    // Scale: assume 3 skills per day is 100%
    const height = Math.min(100, Math.round((skillsCompleted / 3) * 100));
    heights.push(height > 0 ? height : 5); // Minimum 5% for visibility
  }

  chart.innerHTML = heights.map((h, i) => `
    <div class="bar" style="height: ${h}%;" title="${h === 5 && heights[i] === 5 ? '0' : Math.round(h * 3 / 100)} skills"></div>
  `).join('');
}

// ============================================
// Today's Focus - Skills from Roadmap Schedule
// ============================================
function updateTodaysFocus() {
  const userData = getUserData();
  if (!userData) return;

  const progress = getProgress();
  const focusTasks = document.getElementById('focusTasks');
  if (!focusTasks) return;

  // Check if viewing past date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(selectedDate);
  selected.setHours(0, 0, 0, 0);
  const isPast = selected < today;

  // Update view mode indicator
  const viewIndicator = document.getElementById('viewModeIndicator');
  if (viewIndicator) {
    viewIndicator.textContent = isPast ? '👁️ View Only' : '';
  }

  if (isPast) {
    // Show historical view
    const dateKey = getLocalDateKey(selectedDate);
    const completedOnDate = progress.dailyHistory?.[dateKey] || [];

    if (completedOnDate.length === 0) {
      focusTasks.innerHTML = `
        <div class="focus-empty-icon">📜</div>
        <div class="focus-empty-title">No skills completed</div>
        <div class="focus-empty-desc">No progress was recorded on this day</div>
      `;
    } else {
      focusTasks.innerHTML = `
        <div style="text-align: left;">
          <div style="color: var(--accent); font-size: 12px; margin-bottom: 12px;">📜 COMPLETED ON THIS DAY</div>
          ${completedOnDate.map(skillId => `
            <div class="skill-item" style="margin-bottom: 8px; opacity: 0.8;">
              <div class="skill-checkbox checked" style="pointer-events: none;"></div>
              <div class="skill-info">
                <div class="skill-name">${formatSkillName(skillId)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
    return;
  }

  // Get scheduled skills for this week
  const scheduledSkills = getScheduledTasksForDate(selectedDate);

  // Also get dynamic roadmap for next skill suggestion
  const dynamicRoadmap = generateDynamicRoadmap(userData.goal, userData.currentSkills || {});

  // Find all uncompleted skills from roadmap
  let allUncompletedSkills = [];
  if (dynamicRoadmap) {
    for (const phase of dynamicRoadmap.phases) {
      for (const skill of phase.skills) {
        if (!progress.completedSkills.includes(skill.id) && skill.status !== 'known') {
          allUncompletedSkills.push({ skill, phase });
        }
      }
    }
  }

  // Build the focus content showing scheduled + next skills
  let html = '<div style="text-align: left;">';

  // Show scheduled skills for this week
  if (scheduledSkills.length > 0) {
    html += `<div style="color: var(--accent); font-size: 12px; margin-bottom: 12px;">📅 THIS WEEK'S TASKS</div>`;
    scheduledSkills.slice(0, 5).forEach(skill => {
      const isCompleted = progress.completedSkills.includes(skill.id);
      html += `
        <div class="skill-item" style="margin-bottom: 10px;">
          <div class="skill-checkbox ${isCompleted ? 'checked' : ''}" onclick="toggleSkillComplete('${skill.id}', this)"></div>
          <div class="skill-info">
            <div class="skill-name">
              ${skill.name}
              ${skill.core ? '<span style="color: var(--accent); font-size: 10px;">★ CORE</span>' : ''}
            </div>
            <div class="skill-meta">
              <span>${skill.phase || 'Roadmap'}</span>
              <span>⏱️ ${skill.estimatedHours || skill.duration || 3}h</span>
            </div>
          </div>
        </div>
      `;
    });
  }

  // Show next uncompleted skill from roadmap  
  if (allUncompletedSkills.length > 0) {
    const { skill: nextSkill, phase: nextPhase } = allUncompletedSkills[0];
    html += `
      <div style="border-top: 1px solid var(--border); margin-top: 16px; padding-top: 16px;">
        <div style="color: var(--accent); font-size: 12px; margin-bottom: 12px;">🎯 UP NEXT</div>
        <div class="skill-item">
          <div class="skill-checkbox" onclick="toggleSkillComplete('${nextSkill.id}', this)"></div>
          <div class="skill-info">
            <div class="skill-name">
              ${nextSkill.name}
              ${nextSkill.core ? '<span style="color: var(--accent); font-size: 10px;">★ CORE</span>' : ''}
            </div>
            <div class="skill-meta">
              <span>${nextPhase.name}</span>
              <span>⏱️ ${nextSkill.duration}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (scheduledSkills.length === 0 && allUncompletedSkills.length === 0) {
    html = `
      <div class="focus-empty-icon">🎉</div>
      <div class="focus-empty-title">All skills completed!</div>
      <div class="focus-empty-desc">Congratulations on completing your roadmap</div>
    `;
  }

  html += '</div>';
  focusTasks.innerHTML = html;
}

function formatSkillName(skillId) {
  return skillId.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// ============================================
// Initialize Date Display on Load
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize date display
  selectedDate = new Date();
  updateDateDisplay();
  updateStreakFromHistory();
  updateWeekStats();
  updateTrendChart();

  // Initial today's focus update
  setTimeout(() => {
    updateTodaysFocus();
  }, 500);
});

// ============================================
// Matrix Tab - Heatmap & Analytics
// ============================================
let matrixMonth = new Date();

function changeMatrixMonth(direction) {
  matrixMonth.setMonth(matrixMonth.getMonth() + direction);
  renderMatrixTab();
}

function renderMatrixTab() {
  updateMatrixMonthLabel();
  generateHeatmap();
  updateMatrixMetrics();
  renderRoadmapTimeline();
  renderCategoryProgress();
}

function updateMatrixMonthLabel() {
  const label = document.getElementById('matrixMonthLabel');
  if (label) {
    const options = { month: 'long', year: 'numeric' };
    label.textContent = matrixMonth.toLocaleDateString('en-US', options);
  }
}

function generateHeatmap() {
  const container = document.getElementById('matrixHeatmap');
  if (!container) return;

  const progress = getProgress();
  const dailyHistory = progress.dailyHistory || {};

  const year = matrixMonth.getFullYear();
  const month = matrixMonth.getMonth();
  const today = new Date();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let html = '';

  // Header row with day names
  html += '<div class="heatmap-header"></div>'; // Empty corner
  dayNames.forEach(day => {
    html += `<div class="heatmap-header">${day}</div>`;
  });

  // Calculate weeks
  const weeks = Math.ceil((daysInMonth + startDayOfWeek) / 7);

  for (let week = 0; week < weeks; week++) {
    // Week label
    const weekStartDay = week * 7 - startDayOfWeek + 1;
    html += `<div class="heatmap-row-label">W${week + 1}</div>`;

    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const dayNum = week * 7 + dayOfWeek - startDayOfWeek + 1;

      if (dayNum < 1 || dayNum > daysInMonth) {
        html += '<div class="heatmap-cell" style="opacity: 0;"></div>';
      } else {
        const cellDate = new Date(year, month, dayNum);
        const dateKey = getLocalDateKey(cellDate);
        const skillsCount = dailyHistory[dateKey]?.length || 0;

        // Determine intensity level (0-4) based on skills completed
        let level = 0;
        if (skillsCount >= 4) level = 4;
        else if (skillsCount >= 3) level = 3;
        else if (skillsCount >= 2) level = 2;
        else if (skillsCount >= 1) level = 1;

        // Check if today or future
        const isToday = dateKey === getLocalDateKey(today);
        const isFuture = cellDate > today;

        const classes = [
          'heatmap-cell',
          `level-${level}`,
          isToday ? 'today' : '',
          isFuture ? 'future' : ''
        ].filter(Boolean).join(' ');

        const tooltip = `${cellDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${skillsCount} skill${skillsCount !== 1 ? 's' : ''}`;

        html += `<div class="${classes}" data-tooltip="${tooltip}" data-date="${dateKey}"></div>`;
      }
    }
  }

  container.innerHTML = html;
}

function updateMatrixMetrics() {
  const progress = getProgress();
  const dailyHistory = progress.dailyHistory || {};

  const year = matrixMonth.getFullYear();
  const month = matrixMonth.getMonth();
  const today = new Date();

  // Count active days this month
  let activeDays = 0;
  let totalDays = 0;

  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const checkDate = new Date(year, month, day);
    if (checkDate > today) break;

    totalDays++;
    const dateKey = getLocalDateKey(checkDate);
    if (dailyHistory[dateKey] && dailyHistory[dateKey].length > 0) {
      activeDays++;
    }
  }

  // Update completion rate
  const completionRate = totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0;
  const rateEl = document.getElementById('matrixCompletionRate');
  if (rateEl) rateEl.textContent = `${completionRate}%`;

  // Update streak stats
  const currentStreakEl = document.getElementById('matrixCurrentStreak');
  const longestStreakEl = document.getElementById('matrixLongestStreak');
  const monthActiveEl = document.getElementById('matrixMonthActive');

  if (currentStreakEl) currentStreakEl.textContent = `${progress.streakData?.current || 0} days`;
  if (longestStreakEl) longestStreakEl.textContent = `${progress.streakData?.longest || 0} days`;
  if (monthActiveEl) monthActiveEl.textContent = `${activeDays} days`;

  // Calculate best day
  calculateBestDay(dailyHistory);
}

function calculateBestDay(dailyHistory) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  Object.keys(dailyHistory).forEach(dateKey => {
    const date = new Date(dateKey);
    const dayOfWeek = date.getDay();
    dayCounts[dayOfWeek] += dailyHistory[dateKey].length;
  });

  const maxCount = Math.max(...dayCounts);
  const bestDayIndex = dayCounts.indexOf(maxCount);

  const bestDayEl = document.getElementById('matrixBestDay');
  if (bestDayEl) {
    if (maxCount > 0) {
      bestDayEl.textContent = dayNames[bestDayIndex];
    } else {
      bestDayEl.textContent = '--';
    }
  }
}

// ============================================
// Roadmap Timeline Rendering
// ============================================
function renderRoadmapTimeline() {
  const container = document.getElementById('roadmapTimeline');
  if (!container) return;

  // Get or create schedule
  const userData = getUserData();
  if (!userData?.goal) return;

  const schedule = getRoadmapSchedule() || calculateRoadmapSchedule(userData.goal);
  if (!schedule || !schedule.weeks) {
    container.innerHTML = '<div class="text-muted text-center" style="padding: 20px;">No schedule available</div>';
    return;
  }

  const progress = getProgress();
  const currentWeek = getCurrentWeekNumber();

  // Update header stats
  const weeksEl = document.getElementById('timelineWeeks');
  const currentWeekEl = document.getElementById('currentWeekNum');

  if (weeksEl) weeksEl.textContent = `${schedule.weeks.length} weeks`;
  if (currentWeekEl) currentWeekEl.textContent = `Week ${currentWeek}`;

  // Render timeline
  let html = '';

  schedule.weeks.forEach((week, index) => {
    const weekNum = index + 1;
    const isCurrent = weekNum === currentWeek;
    const isPast = weekNum < currentWeek;

    // Check if all skills in this week are completed
    const completedCount = week.skills.filter(s =>
      progress.completedSkills.includes(s.id)
    ).length;
    const isWeekComplete = completedCount === week.skills.length && week.skills.length > 0;

    const weekClass = [
      'timeline-week',
      isCurrent ? 'current' : '',
      isPast && isWeekComplete ? 'completed' : ''
    ].filter(Boolean).join(' ');

    html += `
      <div class="${weekClass}">
        <div class="timeline-week-header">
          <div class="timeline-week-title">
            ${isCurrent ? '🔥 ' : ''}Week ${weekNum}
          </div>
          <div class="timeline-week-hours">${week.totalHours}h</div>
        </div>
        <div class="timeline-skills">
          ${week.skills.slice(0, 5).map(skill => {
      const isCompleted = progress.completedSkills.includes(skill.id);
      const skillClass = [
        'timeline-skill',
        isCompleted ? 'completed' : '',
        skill.core ? 'core' : ''
      ].filter(Boolean).join(' ');
      return `<div class="${skillClass}" title="${skill.name}">${skill.name}</div>`;
    }).join('')}
          ${week.skills.length > 5 ? `<div class="timeline-skill" style="opacity: 0.6;">+${week.skills.length - 5} more</div>` : ''}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderCategoryProgress() {
  const container = document.getElementById('matrixCategories');
  if (!container) return;

  const userData = getUserData();
  if (!userData) return;

  const progress = getProgress();
  const template = roadmapTemplates[userData.goal];
  if (!template) return;

  let html = '';

  template.phases.forEach(phase => {
    const totalSkills = phase.skills.length;
    const completedSkills = phase.skills.filter(s =>
      progress.completedSkills.includes(s.id) || s.status === 'known'
    ).length;
    const percent = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;

    html += `
      <div class="category-row">
        <div class="category-icon">${phase.icon}</div>
        <div class="category-info">
          <div class="category-name">${phase.name}</div>
          <div class="category-stats">${completedSkills}/${totalSkills} skills completed</div>
        </div>
        <div class="category-progress">
          <div class="category-progress-bar">
            <div class="category-progress-fill" style="width: ${percent}%;"></div>
          </div>
        </div>
        <div class="category-percent">${percent}%</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Initialize Matrix tab when switching to it
function initMatrixTab() {
  matrixMonth = new Date();

  // Force regenerate schedule based on current goal to ensure sync
  const userData = getUserData();
  if (userData?.goal) {
    // Clear old schedule and regenerate
    localStorage.removeItem('internpath_schedule');
    calculateRoadmapSchedule(userData.goal);
  }

  renderMatrixTab();
}

// ============================================
// Profile Tab - Portfolio & Links Management
// ============================================

// Get profile data from localStorage
function getProfileData() {
  const data = localStorage.getItem('internpath_profile');
  return data ? JSON.parse(data) : {
    platformLinks: {
      linkedin: { url: '', isPublic: true },
      github: { url: '', isPublic: true },
      resume: { url: '', isPublic: true },
      leetcode: { url: '', isPublic: true },
      hackerrank: { url: '', isPublic: true }
    },
    customProjects: [],
    featuredProjectId: null,
    codingStats: {
      leetcodeProblems: 0,
      hackerrankChallenges: 0,
      lastUpdated: null
    }
  };
}

// Save profile data to localStorage
function saveProfileData(data) {
  localStorage.setItem('internpath_profile', JSON.stringify(data));
}

// URL Validation
function isValidUrl(url) {
  if (!url || url.trim() === '') return true; // Empty is valid (no link)
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Initialize Profile Tab
function initProfileTab() {
  const userData = getUserData();
  const profileData = getProfileData();
  const progress = getProgress();

  // Update profile header
  const nameEl = document.getElementById('profileName');
  const goalEl = document.getElementById('profileGoal');

  if (nameEl && userData?.name) {
    nameEl.textContent = `Welcome, ${userData.name}!`;
  }

  if (goalEl && userData?.goal) {
    const goalNames = {
      frontend: 'Frontend Developer',
      backend: 'Backend Developer',
      fullstack: 'Fullstack Developer',
      datascience: 'Data Scientist',
      ml: 'ML Engineer',
      devops: 'DevOps Engineer',
      mobile: 'Mobile Developer',
      uiux: 'UI/UX Designer'
    };
    goalEl.textContent = `Career Goal: ${goalNames[userData.goal] || userData.goal}`;
  }

  // Update stats
  updateProfileStats();

  // Render avatar
  renderAvatar();

  // Render bio
  renderBio();

  // Render platform links
  renderPlatformLinks();

  // Render custom projects
  renderCustomProjects();

  // Render coding analytics
  renderCodingAnalytics();
}

// Update profile stats in header
function updateProfileStats() {
  const profileData = getProfileData();

  // Count platform links
  let linksCount = 0;
  Object.values(profileData.platformLinks).forEach(link => {
    if (link.url && link.url.trim() !== '') linksCount++;
  });

  // Count projects
  const projectsCount = profileData.customProjects?.length || 0;

  const linksEl = document.getElementById('profileLinksCount');
  const projectsEl = document.getElementById('profileProjectsCount');

  if (linksEl) linksEl.textContent = linksCount;
  if (projectsEl) projectsEl.textContent = projectsCount;
}

// Render platform links
function renderPlatformLinks() {
  const profileData = getProfileData();
  const platforms = ['linkedin', 'github', 'resume', 'leetcode', 'hackerrank'];

  platforms.forEach(platform => {
    const link = profileData.platformLinks[platform];
    const urlTextEl = document.getElementById(`${platform}-url-text`);
    const openBtn = document.getElementById(`${platform}-open-btn`);
    const visibilityCheckbox = document.getElementById(`${platform}-visibility`);
    const inputEl = document.getElementById(`${platform}-input`);

    if (urlTextEl) {
      if (link?.url && link.url.trim() !== '') {
        // Show truncated URL
        try {
          const urlObj = new URL(link.url);
          urlTextEl.textContent = urlObj.hostname + urlObj.pathname.substring(0, 20) + '...';
        } catch {
          urlTextEl.textContent = link.url.substring(0, 30) + '...';
        }
        urlTextEl.classList.add('has-link');
      } else {
        urlTextEl.textContent = platform === 'resume' ? 'Not added' : 'Not connected';
        urlTextEl.classList.remove('has-link');
      }
    }

    if (openBtn) {
      openBtn.disabled = !link?.url || link.url.trim() === '';
    }

    if (visibilityCheckbox) {
      visibilityCheckbox.checked = link?.isPublic !== false;
    }

    if (inputEl) {
      inputEl.value = link?.url || '';
    }
  });
}

// Toggle link edit mode
function toggleLinkEdit(platform) {
  const displayEl = document.getElementById(`${platform}-display`);
  const editEl = document.getElementById(`${platform}-edit`);
  const errorEl = document.getElementById(`${platform}-error`);

  if (displayEl && editEl) {
    const isEditing = editEl.style.display !== 'none';

    displayEl.style.display = isEditing ? 'flex' : 'none';
    editEl.style.display = isEditing ? 'none' : 'block';

    if (errorEl) errorEl.textContent = '';

    // Focus input when entering edit mode
    if (!isEditing) {
      const inputEl = document.getElementById(`${platform}-input`);
      if (inputEl) inputEl.focus();
    }
  }
}

// Cancel link edit
function cancelLinkEdit(platform) {
  const profileData = getProfileData();
  const inputEl = document.getElementById(`${platform}-input`);
  const errorEl = document.getElementById(`${platform}-error`);

  if (inputEl) {
    inputEl.value = profileData.platformLinks[platform]?.url || '';
  }

  if (errorEl) errorEl.textContent = '';

  toggleLinkEdit(platform);
}

// Save platform link
function savePlatformLink(platform) {
  const inputEl = document.getElementById(`${platform}-input`);
  const errorEl = document.getElementById(`${platform}-error`);

  if (!inputEl) return;

  const url = inputEl.value.trim();

  // Validate URL
  if (url && !isValidUrl(url)) {
    if (errorEl) errorEl.textContent = 'Please enter a valid URL';
    return;
  }

  // Save to profile data
  const profileData = getProfileData();
  if (!profileData.platformLinks[platform]) {
    profileData.platformLinks[platform] = { url: '', isPublic: true };
  }
  profileData.platformLinks[platform].url = url;
  saveProfileData(profileData);

  // Update UI
  renderPlatformLinks();
  updateProfileStats();
  toggleLinkEdit(platform);
}

// Toggle link visibility
function toggleLinkVisibility(platform) {
  const checkbox = document.getElementById(`${platform}-visibility`);
  if (!checkbox) return;

  const profileData = getProfileData();
  if (!profileData.platformLinks[platform]) {
    profileData.platformLinks[platform] = { url: '', isPublic: true };
  }
  profileData.platformLinks[platform].isPublic = checkbox.checked;
  saveProfileData(profileData);
}

// Open platform link
function openPlatformLink(platform) {
  const profileData = getProfileData();
  const url = profileData.platformLinks[platform]?.url;

  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

// ============================================
// Custom Projects Management
// ============================================

// Render custom projects
function renderCustomProjects() {
  const profileData = getProfileData();
  const projectsGrid = document.getElementById('projectsGrid');
  const emptyMessage = document.getElementById('emptyProjectsMessage');
  const featuredContainer = document.getElementById('featuredProjectContainer');

  if (!projectsGrid) return;

  const projects = profileData.customProjects || [];

  // Handle featured project
  const featuredProject = projects.find(p => p.id === profileData.featuredProjectId);
  if (featuredProject && featuredContainer) {
    featuredContainer.style.display = 'block';
    document.getElementById('featuredProjectTitle').textContent = featuredProject.title;
    document.getElementById('featuredProjectDesc').textContent = featuredProject.description || 'No description';
    document.getElementById('featuredProjectLink').href = featuredProject.url;
  } else if (featuredContainer) {
    featuredContainer.style.display = 'none';
  }

  // Filter out featured project from regular grid
  const regularProjects = projects.filter(p => p.id !== profileData.featuredProjectId);

  if (regularProjects.length === 0) {
    if (emptyMessage) emptyMessage.style.display = 'block';
    // Clear any existing project cards
    const existingCards = projectsGrid.querySelectorAll('.project-card');
    existingCards.forEach(card => card.remove());
    return;
  }

  if (emptyMessage) emptyMessage.style.display = 'none';

  // Generate project cards HTML
  let html = '';
  regularProjects.forEach(project => {
    html += `
      <div class="project-card" data-project-id="${project.id}">
        <div class="project-card-header">
          <h4 class="project-card-title">${escapeHtml(project.title)}</h4>
          <div class="project-card-actions">
            <button class="btn-icon-sm" onclick="pinProject('${project.id}')" title="Pin as Featured">📌</button>
            <button class="btn-icon-sm" onclick="deleteProject('${project.id}')" title="Delete">🗑️</button>
          </div>
        </div>
        <p class="project-card-desc">${escapeHtml(project.description || 'No description')}</p>
        <div class="project-card-footer">
          <a href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">Visit →</a>
        </div>
      </div>
    `;
  });

  // Update grid (preserve empty message element)
  const existingCards = projectsGrid.querySelectorAll('.project-card');
  existingCards.forEach(card => card.remove());
  projectsGrid.insertAdjacentHTML('beforeend', html);
}

// Escape HTML for security
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show add project modal
function showAddProjectModal() {
  const modal = document.getElementById('addProjectModal');
  if (modal) {
    modal.style.display = 'flex';
    document.getElementById('projectTitleInput').value = '';
    document.getElementById('projectUrlInput').value = '';
    document.getElementById('projectDescInput').value = '';
    document.getElementById('projectUrlError').textContent = '';
    document.getElementById('projectTitleInput').focus();
  }
}

// Hide add project modal
function hideAddProjectModal() {
  const modal = document.getElementById('addProjectModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Save new project
function saveNewProject() {
  const titleInput = document.getElementById('projectTitleInput');
  const urlInput = document.getElementById('projectUrlInput');
  const descInput = document.getElementById('projectDescInput');
  const urlError = document.getElementById('projectUrlError');

  const title = titleInput?.value.trim();
  const url = urlInput?.value.trim();
  const description = descInput?.value.trim();

  // Validation
  if (!title) {
    alert('Please enter a project title');
    return;
  }

  if (!url) {
    if (urlError) urlError.textContent = 'Please enter a project URL';
    return;
  }

  if (!isValidUrl(url)) {
    if (urlError) urlError.textContent = 'Please enter a valid URL';
    return;
  }

  // Create new project
  const profileData = getProfileData();
  const newProject = {
    id: 'proj_' + Date.now(),
    title,
    url,
    description,
    createdAt: new Date().toISOString(),
    isPinned: false
  };

  if (!profileData.customProjects) {
    profileData.customProjects = [];
  }
  profileData.customProjects.push(newProject);
  saveProfileData(profileData);

  // Update UI
  renderCustomProjects();
  updateProfileStats();
  hideAddProjectModal();
}

// Delete project
function deleteProject(projectId) {
  if (!confirm('Are you sure you want to delete this project?')) return;

  const profileData = getProfileData();
  profileData.customProjects = profileData.customProjects.filter(p => p.id !== projectId);

  // Clear featured if this was the featured project
  if (profileData.featuredProjectId === projectId) {
    profileData.featuredProjectId = null;
  }

  saveProfileData(profileData);
  renderCustomProjects();
  updateProfileStats();
}

// Pin project as featured
function pinProject(projectId) {
  const profileData = getProfileData();
  profileData.featuredProjectId = projectId;
  saveProfileData(profileData);
  renderCustomProjects();
}

// Unpin featured project
function unpinFeaturedProject() {
  const profileData = getProfileData();
  profileData.featuredProjectId = null;
  saveProfileData(profileData);
  renderCustomProjects();
}

// ============================================
// Coding Analytics
// ============================================

let currentStatsPlatform = null;

// Render coding analytics
function renderCodingAnalytics() {
  const profileData = getProfileData();
  const progress = getProgress();

  // LeetCode
  const leetcodeEl = document.getElementById('leetcodeProblems');
  const leetcodeTrendEl = document.getElementById('leetcodeTrend');
  if (leetcodeEl) {
    leetcodeEl.textContent = profileData.codingStats?.leetcodeProblems || 0;
  }
  if (leetcodeTrendEl) {
    const count = profileData.codingStats?.leetcodeProblems || 0;
    leetcodeTrendEl.textContent = count > 0 ? `Keep it up! ${count} problems solved` : 'Start tracking your progress';
  }

  // HackerRank
  const hackerrankEl = document.getElementById('hackerrankChallenges');
  const hackerrankTrendEl = document.getElementById('hackerrankTrend');
  if (hackerrankEl) {
    hackerrankEl.textContent = profileData.codingStats?.hackerrankChallenges || 0;
  }
  if (hackerrankTrendEl) {
    const count = profileData.codingStats?.hackerrankChallenges || 0;
    hackerrankTrendEl.textContent = count > 0 ? `Great work! ${count} challenges completed` : 'Start tracking your progress';
  }

  // Streak from progress data
  const streakEl = document.getElementById('profileCurrentStreak');
  const consistencyTrendEl = document.getElementById('consistencyTrend');
  if (streakEl) {
    streakEl.textContent = progress.streakData?.current || 0;
  }
  if (consistencyTrendEl) {
    const streak = progress.streakData?.current || 0;
    if (streak === 0) {
      consistencyTrendEl.textContent = 'Complete a task to start your streak!';
    } else if (streak < 7) {
      consistencyTrendEl.textContent = `${7 - streak} more days to reach 1 week!`;
    } else {
      consistencyTrendEl.textContent = `Amazing! ${streak} day streak! 🔥`;
    }
  }
}

// Show update stats modal
function updateCodingStats(platform) {
  currentStatsPlatform = platform;
  const modal = document.getElementById('updateStatsModal');
  const titleEl = document.getElementById('updateStatsTitle');
  const labelEl = document.getElementById('updateStatsLabel');
  const inputEl = document.getElementById('statsValueInput');
  const profileData = getProfileData();

  if (platform === 'leetcode') {
    titleEl.textContent = 'Update LeetCode Stats';
    labelEl.textContent = 'Total Problems Solved';
    inputEl.value = profileData.codingStats?.leetcodeProblems || 0;
  } else if (platform === 'hackerrank') {
    titleEl.textContent = 'Update HackerRank Stats';
    labelEl.textContent = 'Total Challenges Completed';
    inputEl.value = profileData.codingStats?.hackerrankChallenges || 0;
  }

  if (modal) {
    modal.style.display = 'flex';
    inputEl.focus();
  }
}

// Hide update stats modal
function hideUpdateStatsModal() {
  const modal = document.getElementById('updateStatsModal');
  if (modal) {
    modal.style.display = 'none';
  }
  currentStatsPlatform = null;
}

// Save updated stats
function saveUpdatedStats() {
  const inputEl = document.getElementById('statsValueInput');
  const value = parseInt(inputEl?.value) || 0;

  const profileData = getProfileData();
  if (!profileData.codingStats) {
    profileData.codingStats = { leetcodeProblems: 0, hackerrankChallenges: 0, lastUpdated: null };
  }

  if (currentStatsPlatform === 'leetcode') {
    profileData.codingStats.leetcodeProblems = value;
  } else if (currentStatsPlatform === 'hackerrank') {
    profileData.codingStats.hackerrankChallenges = value;
  }

  profileData.codingStats.lastUpdated = new Date().toISOString();
  saveProfileData(profileData);

  renderCodingAnalytics();
  hideUpdateStatsModal();
}

// ============================================
// Bio Management
// ============================================

// Toggle bio edit mode
function toggleBioEdit() {
  const displayEl = document.getElementById('bioDisplay');
  const editEl = document.getElementById('bioEdit');
  const inputEl = document.getElementById('bioInput');
  const profileData = getProfileData();

  if (displayEl && editEl) {
    const isEditing = editEl.style.display !== 'none';

    displayEl.style.display = isEditing ? 'block' : 'none';
    editEl.style.display = isEditing ? 'none' : 'block';

    if (!isEditing) {
      inputEl.value = profileData.bio || '';
      updateBioCharCount();
      inputEl.focus();
    }
  }
}

// Save bio
function saveBio() {
  const inputEl = document.getElementById('bioInput');
  const bio = inputEl?.value.trim() || '';

  const profileData = getProfileData();
  profileData.bio = bio;
  saveProfileData(profileData);

  renderBio();
  toggleBioEdit();
}

// Cancel bio edit
function cancelBioEdit() {
  toggleBioEdit();
}

// Render bio
function renderBio() {
  const profileData = getProfileData();
  const bioTextEl = document.getElementById('bioText');

  if (bioTextEl) {
    if (profileData.bio && profileData.bio.trim() !== '') {
      bioTextEl.textContent = profileData.bio;
      bioTextEl.classList.remove('placeholder');
    } else {
      bioTextEl.textContent = 'Click the edit button to add your bio...';
      bioTextEl.classList.add('placeholder');
    }
  }
}

// Update bio character count
function updateBioCharCount() {
  const inputEl = document.getElementById('bioInput');
  const countEl = document.getElementById('bioCharCount');
  if (inputEl && countEl) {
    countEl.textContent = inputEl.value.length;
  }
}

// Add event listener for bio character count
document.addEventListener('DOMContentLoaded', () => {
  const bioInput = document.getElementById('bioInput');
  if (bioInput) {
    bioInput.addEventListener('input', updateBioCharCount);
  }
});

// ============================================
// Avatar Picker
// ============================================

// Available avatar emojis
const avatarEmojis = [
  '👤', '👨', '👩', '🧑', '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎓', '👩‍🎓', '🧑‍🎓',
  '👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🔬', '👩‍🔬', '🧑‍🔬', '👨‍🎨', '👩‍🎨', '🧑‍🎨', '👨‍🚀',
  '👩‍🚀', '🧑‍🚀', '🦸', '🦸‍♂️', '🦸‍♀️', '🧙', '🧙‍♂️', '🧙‍♀️', '🧛', '🧜',
  '🐱', '🐶', '🦊', '🐼', '🐨', '🦁', '🐯', '🐸', '🦄', '🐲',
  '🤖', '👾', '👽', '💀', '🎭', '🎨', '💻', '🚀', '⭐', '🔥'
];

// Show avatar picker modal
function showAvatarPicker() {
  const modal = document.getElementById('avatarPickerModal');
  const grid = document.getElementById('avatarPickerGrid');
  const profileData = getProfileData();
  const currentAvatar = profileData.avatar || '👤';

  if (grid) {
    grid.innerHTML = avatarEmojis.map(emoji => `
      <div class="avatar-option ${emoji === currentAvatar ? 'selected' : ''}" 
           onclick="selectAvatar('${emoji}')" 
           title="Select ${emoji}">
        ${emoji}
      </div>
    `).join('');
  }

  if (modal) {
    modal.style.display = 'flex';
  }
}

// Hide avatar picker modal
function hideAvatarPicker() {
  const modal = document.getElementById('avatarPickerModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Select avatar
function selectAvatar(emoji) {
  const profileData = getProfileData();
  profileData.avatar = emoji;
  saveProfileData(profileData);

  renderAvatar();
  hideAvatarPicker();
}

// Render avatar
function renderAvatar() {
  const profileData = getProfileData();
  const avatarEl = document.getElementById('profileAvatar');

  if (avatarEl) {
    avatarEl.textContent = profileData.avatar || '👤';
  }
}
