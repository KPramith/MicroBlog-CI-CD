// Data handling functions
function getPosts() {
    const posts = localStorage.getItem('microblog-posts');
    return posts ? JSON.parse(posts) : [
      {
        id: 1,
        title: 'Getting Started with MicroBlog',
        content: 'This is a simple blogging platform that works entirely in your browser. All posts are stored in localStorage.',
        author: 'Admin',
        date: new Date().toISOString()
      }
    ];
  }
  
  function savePosts(posts) {
    localStorage.setItem('microblog-posts', JSON.stringify(posts));
  }
  
  function addPost(post) {
    const posts = getPosts();
    const newPost = {
      id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
      title: post.title,
      content: post.content,
      author: post.author,
      date: new Date().toISOString()
    };
    posts.unshift(newPost);
    savePosts(posts);
    return newPost;
  }
  
  function deletePost(id) {
    const posts = getPosts();
    const updatedPosts = posts.filter(post => post.id !== id);
    savePosts(updatedPosts);
    return updatedPosts;
  }
  
  // Toast notification
  function showToast(message, isSuccess = true) {
    const toast = document.getElementById('toast');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    if (isSuccess) {
      toastIcon.className = 'fas fa-check-circle toast-icon success';
    } else {
      toastIcon.className = 'fas fa-exclamation-circle toast-icon error';
    }
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
  
  // Homepage functionality
  if (document.getElementById('posts')) {
    document.addEventListener('DOMContentLoaded', () => {
      function loadPosts() {
        const postsContainer = document.getElementById('posts');
        const posts = getPosts();
        
        postsContainer.innerHTML = '';
        
        if (posts.length === 0) {
          postsContainer.innerHTML = '<div class="no-posts">No posts yet. <a href="new.html">Create the first post!</a></div>';
          return;
        }
        
        posts.forEach(post => {
          const date = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          
          const postElement = document.createElement('article');
          postElement.className = 'post-card';
          postElement.dataset.id = post.id;
          postElement.innerHTML = `
            <div class="post-content">
              <div class="post-header">
                <h3>${post.title}</h3>
                <button class="delete-btn" data-id="${post.id}" title="Delete post">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <p class="post-meta">
                <span><i class="fas fa-user"></i> ${post.author}</span>
                <span><i class="fas fa-calendar"></i> ${date}</span>
              </p>
              <p class="post-excerpt">${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
            </div>
          `;
          
          postsContainer.appendChild(postElement);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
          button.addEventListener('click', function() {
            const postId = parseInt(this.getAttribute('data-id'));
            const postElement = this.closest('.post-card');
            
            if (confirm('Are you sure you want to delete this post?')) {
              deletePost(postId);
              postElement.classList.add('fade-out');
              
              setTimeout(() => {
                postElement.remove();
                if (document.querySelectorAll('.post-card').length === 0) {
                  postsContainer.innerHTML = '<div class="no-posts">No posts yet. <a href="new.html">Create the first post!</a></div>';
                }
                showToast('Post deleted successfully!');
              }, 300);
            }
          });
        });
      }
      
      loadPosts();
    });
  }
  
  // New post page functionality
  if (document.getElementById('post-form')) {
    document.addEventListener('DOMContentLoaded', () => {
      const form = document.getElementById('post-form');
      const formStatus = document.getElementById('form-status');
      
      // Try to pre-fill author name from localStorage if available
      const savedAuthor = localStorage.getItem('authorName');
      if (savedAuthor) {
        document.getElementById('author').value = savedAuthor;
      }
      
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const content = document.getElementById('content').value;
        
        // Show loading state
        formStatus.innerHTML = '<p class="loading">Publishing your post...</p>';
        
        try {
          // Add the new post
          addPost({ title, author, content });
          
          // Show success message
          formStatus.innerHTML = '<p class="success">Post published successfully! Redirecting to homepage...</p>';
          
          // Save author name to localStorage for future use
          localStorage.setItem('authorName', author);
          
          // Redirect to homepage after 1.5 seconds
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1500);
          
        } catch (error) {
          console.error('Error publishing post:', error);
          formStatus.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
      });
    });
  }