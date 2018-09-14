require 'json'
package = JSON.parse(File.read('../package.json'))

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
  s.platform     = :ios, '9.0'
  s.source       = { :git => package['repository'], :tag => "v#{s.version}" }
  s.source_files = 'RNTextSize/**/*.{h,m}'
  s.requires_arc = true

  s.dependency 'React'
end

