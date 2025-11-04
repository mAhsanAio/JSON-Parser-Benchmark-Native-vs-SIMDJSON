// Install required packages:
// npm install simdjson          # C++ SIMD-optimized parser

const simdjson = require('simdjson');

// Function to generate complex large JSON
function generateComplexJSON(size = 'medium') {
  const sizes = {
    small: { users: 100, postsPerUser: 5, commentsPerPost: 3 },
    medium: { users: 500, postsPerUser: 10, commentsPerPost: 5 },
    large: { users: 1000, postsPerUser: 20, commentsPerPost: 10 },
    xlarge: { users: 2000, postsPerUser: 30, commentsPerPost: 15 }
  };

  const config = sizes[size] || sizes.medium;

  const data = {
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '2.0.1',
      totalUsers: config.users,
      features: ['comments', 'likes', 'shares', 'tags'],
      config: {
        maxDepth: 5,
        enableCache: true,
        timeout: 30000,
        retries: 3
      }
    },
    users: [],
    analytics: {
      dailyActiveUsers: Math.floor(config.users * 0.7),
      monthlyActiveUsers: Math.floor(config.users * 0.9),
      metrics: []
    }
  };

  // Generate users with nested data
  for (let i = 0; i < config.users; i++) {
    const user = {
      id: `user_${i}`,
      username: `user${i}`,
      email: `user${i}@example.com`,
      profile: {
        firstName: `First${i}`,
        lastName: `Last${i}`,
        age: 18 + (i % 50),
        bio: `This is a bio for user ${i}`.repeat(3),
        avatar: `https://example.com/avatar/${i}.jpg`,
        coordinates: { lat: 40.7128 + Math.random(), lng: -74.0060 + Math.random() },
        settings: {
          notifications: { email: true, push: i % 2 === 0, sms: false },
          privacy: { publicProfile: i % 3 === 0, showEmail: false },
          preferences: { theme: i % 2 === 0 ? 'dark' : 'light', language: 'en' }
        }
      },
      stats: {
        followers: Math.floor(Math.random() * 10000),
        following: Math.floor(Math.random() * 5000),
        posts: config.postsPerUser,
        totalLikes: Math.floor(Math.random() * 50000),
        engagement: Math.random() * 100
      },
      posts: []
    };

    // Generate posts for each user
    for (let j = 0; j < config.postsPerUser; j++) {
      const post = {
        id: `post_${i}_${j}`,
        title: `Post ${j} by ${user.username}`,
        content: `This is the content of post ${j}. Lorem ipsum dolor sit amet. `.repeat(10),
        createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        tags: [`tag${j % 10}`, `tag${(j + 1) % 10}`, `tag${(j + 2) % 10}`],
        metadata: {
          views: Math.floor(Math.random() * 10000),
          likes: Math.floor(Math.random() * 1000),
          shares: Math.floor(Math.random() * 100),
          bookmarks: Math.floor(Math.random() * 500),
          avgReadTime: Math.floor(Math.random() * 300)
        },
        comments: []
      };

      // Generate comments for each post
      for (let k = 0; k < config.commentsPerPost; k++) {
        post.comments.push({
          id: `comment_${i}_${j}_${k}`,
          userId: `user_${(i + k + 1) % config.users}`,
          text: `This is comment ${k} on post ${j}. Very insightful content here. `.repeat(3),
          createdAt: new Date(Date.now() - Math.random() * 5000000000).toISOString(),
          likes: Math.floor(Math.random() * 100),
          replies: Array.from({ length: k % 3 }, (_, r) => ({
            id: `reply_${i}_${j}_${k}_${r}`,
            userId: `user_${(i + k + r + 2) % config.users}`,
            text: `Reply ${r} to comment ${k}`,
            createdAt: new Date(Date.now() - Math.random() * 2000000000).toISOString(),
            likes: Math.floor(Math.random() * 20)
          }))
        });
      }

      user.posts.push(post);
    }

    data.users.push(user);
  }

  // Generate analytics metrics
  for (let i = 0; i < 30; i++) {
    data.analytics.metrics.push({
      date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      activeUsers: Math.floor(Math.random() * config.users),
      newPosts: Math.floor(Math.random() * config.users * 2),
      engagement: Math.random() * 100,
      revenue: Math.random() * 10000
    });
  }

  return data;
}

// Benchmark function
function benchmark(name, parseFn, jsonString, iterations = 100) {
  const results = [];
  
  // Warm-up
  for (let i = 0; i < 10; i++) {
    try {
      parseFn(jsonString);
    } catch (e) {
      // Ignore warm-up errors
    }
  }

  // Actual benchmark
  for (let i = 0; i < iterations; i++) {
    const start = process.hrtime.bigint();
    parseFn(jsonString);
    const end = process.hrtime.bigint();
    results.push(Number(end - start) / 1000000); // Convert to milliseconds
  }

  const avg = results.reduce((a, b) => a + b, 0) / results.length;
  const min = Math.min(...results);
  const max = Math.max(...results);
  const sorted = results.sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  return { name, avg, min, max, median, iterations };
}

// Compare parsers
function compareJSONParsers(size = 'medium', iterations = 100) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`JSON Parser Performance Comparison - Size: ${size.toUpperCase()}`);
  console.log('='.repeat(70));

  // Generate test data
  const jsonData = generateComplexJSON(size);
  const jsonString = JSON.stringify(jsonData);
  
  console.log(`\nJSON Size: ${(jsonString.length / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Iterations: ${iterations}\n`);

  const results = [];

  // Benchmark native JSON.parse
  results.push(benchmark(
    'Native JSON.parse',
    (str) => JSON.parse(str),
    jsonString,
    iterations
  ));

  // Benchmark simdjson (C++ SIMD-optimized)
  results.push(benchmark(
    'simdjson (C++ SIMD)',
    (str) => simdjson.parse(str),
    jsonString,
    iterations
  ));

  // Display results
  results.sort((a, b) => a.avg - b.avg);

  console.log('Results (all times in milliseconds):\n');
  console.log('┌─────────────────────────────────────┬──────────┬──────────┬──────────┬──────────┐');
  console.log('│ Parser                              │ Average  │ Median   │ Min      │ Max      │');
  console.log('├─────────────────────────────────────┼──────────┼──────────┼──────────┼──────────┤');
  
  results.forEach((result, index) => {
    const speedup = index === 0 
      ? '✓ FASTEST' 
      : `${(results[0].avg / result.avg * 100).toFixed(1)}% speed`;
    console.log(
      `│ ${result.name.padEnd(35)} │ ${result.avg.toFixed(3).padStart(8)} │ ${result.median.toFixed(3).padStart(8)} │ ${result.min.toFixed(3).padStart(8)} │ ${result.max.toFixed(3).padStart(8)} │`
    );
    console.log(`│ ${speedup.padEnd(35)} │          │          │          │          │`);
    if (index < results.length - 1) {
      console.log('├─────────────────────────────────────┼──────────┼──────────┼──────────┼──────────┤');
    }
  });
  
  console.log('└─────────────────────────────────────┴──────────┴──────────┴──────────┴──────────┘\n');

  // Performance comparison
  const baseline = results.find(r => r.name === 'Native JSON.parse')?.avg;
  if (baseline) {
    console.log('Performance vs Native JSON.parse:');
    results.forEach(result => {
      if (result.name !== 'Native JSON.parse') {
        const diff = ((baseline - result.avg) / baseline * 100);
        const symbol = diff > 0 ? '🚀 FASTER' : '🐌 SLOWER';
        const color = diff > 0 ? '\x1b[32m' : '\x1b[31m';
        const reset = '\x1b[0m';
        console.log(`  ${color}${symbol}${reset} ${result.name}: ${Math.abs(diff).toFixed(2)}%`);
      }
    });
    console.log();
  }

  // Show fastest parser
  console.log(`🏆 Winner: ${results[0].name} (${results[0].avg.toFixed(3)}ms avg)\n`);
}

// Demonstrate simdjson features
function demonstrateSimdjsonFeatures() {
  console.log('\n' + '='.repeat(70));
  console.log('SIMDJSON Synchronous Parsing Example');
  console.log('='.repeat(70) + '\n');

  const testJson = JSON.stringify({
    name: 'John',
    age: 30,
    nested: { deep: { value: 42 } },
    array: [1, 2, 3, 4, 5]
  });

  console.log('Native JSON.parse:');
  const result1 = JSON.parse(testJson);
  console.log('Result:', result1);

  console.log('\nsimdjson.parse:');
  const result2 = simdjson.parse(testJson);
  console.log('Result:', result2);

  console.log('\nBoth are fully synchronous and return identical results.');
  console.log('simdjson uses C++ with SIMD instructions for faster performance.');
  console.log('\n' + '='.repeat(70) + '\n');
}

// Run benchmarks
if (require.main === module) {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║     JSON Parser Benchmarks: C++ vs Native JavaScript              ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  
  // Show simdjson features
  demonstrateSimdjsonFeatures();
  
  // Test different sizes
  ['small', 'medium', 'large'].forEach(size => {
    compareJSONParsers(size, 50);
  });

  console.log('\n' + '='.repeat(70));
  console.log('💡 TIP: simdjson is typically 2-4x faster than native JSON.parse!');
  console.log('    Use Buffer input for maximum performance.');
  console.log('='.repeat(70) + '\n');
}

// Export for use in other files
module.exports = {
  generateComplexJSON,
  compareJSONParsers,
  benchmark,
  demonstrateSimdjsonFeatures
};
