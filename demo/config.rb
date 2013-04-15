require 'slim'

set :slim, {
  :tabsize => 2,
  :format => :html,
  :pretty => true,
  :disable_escape => true,
  #:shortcut => {'@' => 'data-role', '#' => 'id', '.' => 'class'}  # Doesn't seem to work
  }

  set :erb, {
    :layout_engine => :slim
  }

###
# Compass
###

# Susy grids in Compass
# First: gem install compass-susy-plugin
# require 'susy'

# Change Compass configuration
# compass_config do |config|
#   config.output_style = :compact
# end

###
# Haml
###

# CodeRay syntax highlighting in Haml
# First: gem install haml-coderay
# require 'haml-coderay'

# CoffeeScript filters in Haml
# First: gem install coffee-filter
# require 'coffee-filter'

# Automatic image dimensions on image_tag helper
# activate :automatic_image_sizes

###
# Page command
###

# Per-page layout changes:
#
# With no layout
# page "/path/to/file.html", :layout => false
#
# With alternative layout
# page "/path/to/file.html", :layout => :otherlayout
#
# A path which all have the same layout
# with_layout :admin do
#   page "/admin/*"
# end

# Proxy (fake) files
# page "/this-page-has-no-template.html", :proxy => "/template-file.html" do
#   @which_fake_page = "Rendering a fake page with a variable"
# end

[:index, :inset, :pull, :shortpull, :form].each do |base|
  page "/#{base}.html" do
    @base = base
    @is_ver_10 = true
    @is_ver_11 = false
    @is_ver_12 = false
    @is_ver_13 = false
    @link_suffix = ''
    @asset_set = 'v10'
  end
  page "/#{base}_11.html", :proxy => "/#{base}.html" do
    @base = base
    @is_ver_10 = false
    @is_ver_11 = true
    @is_ver_12 = false
    @is_ver_13 = false
    @link_suffix = '_11'
    @asset_set = 'v11'
  end
  page "/#{base}_12.html", :proxy => "/#{base}.html" do
    @base = base
    @is_ver_10 = false
    @is_ver_11 = false
    @is_ver_12 = true
    @is_ver_13 = false
    @link_suffix = '_12'
    @asset_set = 'v12'
  end
  page "/#{base}_13.html", :proxy => "/#{base}.html" do
    @base = base
    @is_ver_10 = false
    @is_ver_11 = false
    @is_ver_12 = false
    @is_ver_13 = true
    @link_suffix = '_13'
    @asset_set = 'v13'
  end
end

###
# Helpers
###

# Methods defined in the helpers block are available in templates
# helpers do
#   def some_helper
#     "Helping"
#   end
# end

helpers do
  def blank_line
    "\n\n"
  end

  def next_line
    "\n"
  end
end

# Change the CSS directory
# set :css_dir, "alternative_css_directory"

# Change the JS directory
# set :js_dir, "alternative_js_directory"

# Change the images directory
# set :images_dir, "alternative_image_directory"

# Build-specific configuration
configure :build do
  # For example, change the Compass output style for deployment
  # activate :minify_css

  # Minify Javascript on build
  # activate :minify_javascript

  # Enable cache buster
  # activate :cache_buster

  # Use relative URLs
   activate :relative_assets

  # Compress PNGs after build
  # First: gem install middleman-smusher
  # require "middleman-smusher"
  # activate :smusher

  # Or use a different image path
  # set :http_path, "/Content/images/"
end