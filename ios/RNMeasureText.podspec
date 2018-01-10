
Pod::Spec.new do |s|
  s.name         = "RNMeasureText"
  s.version      = "1.0.0"
  s.summary      = "RNMeasureText"
  s.description  = <<-DESC
                  RNMeasureText
                   DESC
  s.homepage     = ""
  s.license      = "MIT"
  # s.license      = { :type => "MIT", :file => "FILE_LICENSE" }
  s.author             = { "aMarCruz" => "amarcruz@yahoo.com" }
  s.platform     = :ios, "7.0"
  s.source       = { :git => "https://github.com/amarcruz/RNMeasureText.git", :tag => "master" }
  s.source_files  = "RNMeasureText/**/*.{h,m}"
  s.requires_arc = true


  s.dependency "React"
  #s.dependency "others"

end

