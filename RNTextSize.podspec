require 'json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name         = 'RNTextSize'
  s.version      = package['version']
  s.summary      = package['description']
  s.description  = <<-DESC
                   React Native library to measure blocks of text before laying it on screen and get fonts info,
                   based originally on Airam's react-native-measure-text (support iOS and Android).
                   DESC
  s.homepage     = package['homepage']
  s.license      = package['license']
  s.author       = package['author']
  s.platform     = { :ios => "9.0" }
  s.source       = { :git => package['repository'], :tag => "v#{s.version}" }
  s.source_files = 'ios/**/*.{h,m,mm,swift}'
  s.requires_arc = true

  s.dependency 'React-Core'

  if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
    s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
    s.pod_target_xcconfig    = {
      "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
      "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
      "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
    }

    s.dependency "React-RCTFabric"
    s.dependency "React-Codegen"
    s.dependency "RCT-Folly"
    s.dependency "RCTRequired"
    s.dependency "RCTTypeSafety"
    s.dependency "ReactCommon/turbomodule/core"
  end
end

